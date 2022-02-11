/* eslint-disable @typescript-eslint/ban-ts-ignore */

class Expect<T> {
  private predicates: ((value: T) => boolean)[] = []

  // eslint-disable-next-line no-useless-constructor
  constructor(private value: T) { }

  toExist() {
    this.predicates.push(value => Boolean(value))
    return this
  }

  toBeNull() {
    this.predicates.push(value => value === null)
    return this
  }

  toBeUndefined() {
    this.predicates.push(value => value === undefined)
    return this
  }

  toBeNullOrUndefined() {
    this.predicates.push(value => value === undefined || value === null)
    return this
  }

  toBeNotNull() {
    this.predicates.push(value => value !== null)
    return this
  }

  toBeNotUndefined() {
    this.predicates.push(value => value !== undefined)
    return this
  }

  toBeNotNullOrUndefined() {
    this.predicates.push(value => value !== undefined && value !== null)
    return this
  }

  toBeEqual(otherValue: T) {
    this.predicates.push(value => value === otherValue)
    return this
  }

  toBeNotEqual(otherValue: T) {
    this.predicates.push(value => value !== otherValue)
    return this
  }

  toBeGreaterThan(otherValue: T) {
    this.predicates.push(value => value > otherValue)
    return this
  }

  toBeGreaterThanOrEqualTo(otherValue: T) {
    this.predicates.push(value => value >= otherValue)
    return this
  }

  toBeLessThan(otherValue: T) {
    this.predicates.push(value => value < otherValue)
    return this
  }

  toBeLessThanOrEqualTo(otherValue: T) {
    this.predicates.push(value => value <= otherValue)
    return this
  }

  toMatchPredicate(predicate: (value: T) => boolean) {
    this.predicates.push(predicate)
    return this
  }

  toNotMatchPredicate(predicate: (value: T) => boolean) {
    this.predicates.push(x => !predicate(x))
    return this
  }

  assertWithError<R>(error: R) {
    if (this.predicates === undefined || this.predicates.length === 0) {
      throw new Error('comparison value undefined')
    }

    return this.predicates.reduce((previousValue, currentValue) => {
      return previousValue && currentValue(this.value)
    }, true) ? undefined : error
  }
}

export function expect<T>(value: T) {
  return new Expect(value)
}
