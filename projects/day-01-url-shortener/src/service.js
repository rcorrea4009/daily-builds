// Business logic: validation, code generation, lookup. Knows nothing
// about HTTP and nothing about how storage is implemented.
const CODE_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export class InvalidUrlError extends Error {}
export class CodeNotFoundError extends Error {}

export function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function generateCode(length = 6, random = Math.random) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  }
  return code;
}

export class LinkService {
  constructor(repository, { codeLength = 6, randomFn = Math.random } = {}) {
    this.repository = repository;
    this.codeLength = codeLength;
    this.randomFn = randomFn;
  }

  shorten(longUrl) {
    if (!isValidHttpUrl(longUrl)) {
      throw new InvalidUrlError(`Not a valid http(s) URL: ${longUrl}`);
    }

    let code = generateCode(this.codeLength, this.randomFn);
    while (this.repository.has(code)) {
      code = generateCode(this.codeLength, this.randomFn);
    }

    this.repository.save(code, longUrl);
    return code;
  }

  resolve(code) {
    const entry = this.repository.findByCode(code);
    if (!entry) throw new CodeNotFoundError(`No link for code: ${code}`);
    this.repository.recordHit(code);
    return entry.longUrl;
  }

  stats(code) {
    const entry = this.repository.findByCode(code);
    if (!entry) throw new CodeNotFoundError(`No link for code: ${code}`);
    return entry;
  }
}
