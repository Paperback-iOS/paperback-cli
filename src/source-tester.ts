/* eslint-disable no-console */
/* eslint-disable no-return-await */
/* eslint-disable @typescript-eslint/ban-ts-ignore */
export * from 'paperback-extensions-common/lib/_impl'
import { HomeSection, Manga, Source, SourceManga } from 'paperback-extensions-common'
import { SourceTestRequest, SourceTestResponse } from './devtools/generated/typescript/PDTSourceTester_pb'
import * as path from 'path'
import cheerio from 'cheerio'

export class SourceTester {
  // eslint-disable-next-line no-useless-constructor
  constructor(private bundleDir: string) { }

  async testSource(request: SourceTestRequest, callback: (response: SourceTestResponse) => Promise<void>) {
    const testData = request.getData()

    const sourceFile = require(path.join(this.bundleDir, request.getSourceid(), request.getSourceid()))
    const SourceClass = sourceFile[request.getSourceid()]
    const source: Source = new SourceClass(cheerio)

    // Test Homepage Sections
    await callback(await this.testHomePageAcquisition(source, testData))
    await callback(await this.testGetMangaDetails(source, testData))
    await callback(await this.testGetChapters(source, testData))
    await callback(await this.testGetChapterDetails(source, testData))
  }

  private async testGetChapterDetails(source: Source, testData: SourceTestRequest.TestData | undefined) {
    const testCase = new SourceTestResponse()
    const chapterId = testData?.getChapterid()
    const mangaId = testData?.getMangaid()
    testCase.setTestcase(`Get Chapter Details (${mangaId}, ${chapterId})`)
    testCase.setCompletetime(
      await this.measureTime(async () => {
        if (!mangaId) {
          testCase.addFailures('MangaID not provided; Unable to get MangaId from Home Page Sections')
          return
        }

        if (!chapterId) {
          testCase.addFailures('ChapterID not provided; Unable to get chapter id from chapter list')
          return
        }

        try {
          const chapterDetails = await source.getChapterDetails(mangaId, chapterId);

          (await Promise.all([
            this.expect(chapterDetails.id, 'Chapter ID Mismatch', async x => x !== chapterId),
            this.expect(chapterDetails.mangaId, 'Chapter does not belong to the same manga id', async x => x !== mangaId),
            this.expect(chapterDetails.pages, 'Chapter pages empty', async x => x.length === 0),
          ]))
          .filter(x => x)
          .forEach(x => testCase.addFailures(x!))
        } catch (error: any) {
          testCase.addFailures('Unable to get chapter details. Error: ' + error.message)
        }
      })
    )

    return testCase
  }

  private async testGetChapters(source: Source, testData: SourceTestRequest.TestData | undefined) {
    const testCase = new SourceTestResponse()
    const mangaId = testData?.getMangaid()
    testCase.setTestcase(`Get Chapters (${mangaId})`)
    testCase.setCompletetime(
      await this.measureTime(async () => {
        if (!mangaId) {
          testCase.addFailures('MangaID not provided; Unable to get MangaId from Home Page Sections')
          return
        }

        try {
          const chapters = await source.getChapters(mangaId)
          if (chapters.length === 0) {
            testCase.addFailures('Missing Chapters')
          } else if (testData?.hasChapterid() !== true) {
            testData?.setChapterid(chapters[0]!.id)
          }

          (await Promise.all(
            chapters.flatMap(chapter => [
              this.expect(chapter.id, '[' + chapter.id + '] Chapter ID is invalid' + chapter.id, async id => !id),
              this.expect(chapter.chapNum, '[' + chapter.id + '] Chapter number is NaN', async n => isNaN(n)),
              this.expect(chapter.mangaId, '[' + chapter.id + '] Chapter does not belong to the same manga', async x => x !== mangaId),
              this.expect(chapter.time, '[' + chapter.id + '] Chapter time is invalid', async x => !x),
            ])
          ))
          .filter(x => x)
          .forEach(x => testCase.addFailures(x!))
        } catch (error: any) {
          testCase.addFailures('Unable to get chapter list. Error: ' + error.message)
        }
      })
    )

    return testCase
  }

  private async testGetMangaDetails(source: Source, testData: SourceTestRequest.TestData | undefined) {
    const testCase = new SourceTestResponse()
    const mangaId = testData?.getMangaid()
    testCase.setTestcase(`Get Manga Details (${mangaId})`)
    testCase.setCompletetime(
      await this.measureTime(async () => {
        if (!mangaId) {
          testCase.addFailures('MangaID not provided; Unable to get MangaID from Home Page Sections')
          return
        }

        try {
          // @ts-ignore
          const mangaDetails_: ({ id: string } & Manga) | SourceManga = await source.getMangaDetails(mangaId)

          // eslint-disable-next-line no-inner-declarations
          function isSourceManga(mangaDetails: ({ id: string } & Manga) | SourceManga): mangaDetails is SourceManga {
            return (mangaDetails as SourceManga).mangaInfo !== undefined
          }

          let mangaDetails: { id: string } & Manga
          if (isSourceManga(mangaDetails_)) {
            mangaDetails = { ...mangaDetails_.mangaInfo, id: mangaDetails_.id }
          } else {
            mangaDetails = mangaDetails_
          }

          if (mangaDetails.titles.length === 0) {
            testCase.addFailures('Missing Titles')
          }

          // @ts-ignore
          if (!mangaDetails.id || mangaDetails.id !== mangaId) {
            // @ts-ignore
            testCase.addFailures(`MangaID Mismatch. Expected ${mangaId} got ${mangaDetails.id}`)
          }

          if (!mangaDetails.status) {
            testCase.addFailures('Missing Status')
          }

          if (!mangaDetails.image) {
            testCase.addFailures('Missing Image')
          }
        } catch (error: any) {
          testCase.addFailures(`Unable to get MangaDetails for ID ${mangaId}. Error: ` + error.message)
        }
      })
    )

    return testCase
  }

  private async testHomePageAcquisition(source: Source, testData: SourceTestRequest.TestData | undefined) {
    const homePageTestCase = new SourceTestResponse()
    homePageTestCase.setTestcase('Home Page Acquisition')
    homePageTestCase.setCompletetime(
      await this.measureTime(async () => {
        const sections: Record<string, HomeSection> = {}

        try {
          await source.getHomePageSections?.((x: HomeSection) => {
            sections[x.id] = x
            if (x.items && x.items.length > 0 && testData && !testData.hasMangaid()) {
              testData.setMangaid(x.items[0]!.id)
            }
          })
        } catch (error: any) {
          homePageTestCase.addFailures('Failed to complete Home Page Acquisition, Error: ' + error.message)
        }

        (await Promise.all(
          Object.values(sections).map(
            async section => this.expect(
              section.items?.length ?? 0,
              `Expected section (${section.id}) to not be empty`,
              async itemCount => itemCount === 0
            )
          )
        ))
        .filter(x => x)
        .forEach(x => homePageTestCase.addFailures(x!))
      })
    )
    return homePageTestCase
  }

  async measureTime(closure: () => Promise<void>): Promise<number> {
    const startTime = process.hrtime.bigint()
    await closure()
    const endTime = Number(process.hrtime.bigint() - startTime)
    return (endTime / 1000000)
  }

  async expect<T>(object: T, label: string, predicate: (obj: T) => Promise<boolean>) {
    if (await predicate(object)) {
      return label
    }

    return undefined
  }
}
