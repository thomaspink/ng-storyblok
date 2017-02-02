import { BaseError } from '../common/error';

export class InvalidSlugOrIdAdapterError extends BaseError {
  constructor() {
    super(`Invalid slug or id - the provided slug or id has to be a string or a number!`);
  }
}

export class InvalidVersionAdapterError extends BaseError {
  constructor() {
    super(`Invalid version - the provided version has to be a string!`);
  }
}

export class ResponseBodyEmptyAdapterError extends BaseError {
  constructor(slugOrId: string | number) {
    super(`Could not load story "${slugOrId}"! The response body is empty.`);
  }
}

// export class UnauthorizedError extends BaseError {
//   constructor(slugOrId: string | number) {
//     super(`Could not load story "${slugOrId}"! The response body is empty.`);
//   }
// }
