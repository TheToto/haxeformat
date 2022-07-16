// https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Error

export class HaxeException extends Error {
    data: any

    constructor(data: any) {
        super(`Haxe Exception: ${data}`)

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, HaxeException)
        }

        this.name = "HaxeException"
        this.data = data
    }
}
