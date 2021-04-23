
/**
 * Represents an explicit and somewhat anticipated error
 * The class name is self explanatory.
 *
 * This is derived from MDN and stackoverflow, see
 * 1. The question: https://stackoverflow.com/q/1382107
 * 2. Tero's (edited by RoboCat) answer: https://stackoverflow.com/a/5251506
 * 3. Mohsen's (edited by Kostanos) answer: https://stackoverflow.com/a/32750746
 * 4. The MDN page: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
 *
 * Because of that, the CustomError class is under the CC BY-SA 3.0 License
 * (excluding most of the constructor and the comments which are in the public domain).
 */
class CustomError extends Error {
   /**
    * The constructor is derived from a code snippet from MDN, which in the public domain
    * The constructor is also mostly in the public domain, except for the else statement which is from
    * Wait though, https://stackoverflow.com/a/42755876 by Matt also has this constructor. And it's more full.
    * I'll just say it's not under the Apache License.
    *
    * @param {...*} [args] - The args to the Error constructor. The only guaranteed argument is a string for the error message.
    */
   constructor (...args) {
      super(...args)

      // Maintains proper stack trace for where our error was thrown (only available on V8)
      // You must be pretty sure, and have a really good reason to pass this if statement
      if (String(Error?.captureStackTrace).includes('native code')) {
         Error.captureStackTrace(this, CustomError)
      } else {
         this.stack = (new Error(...args)).stack
      }
   }

   /**
    * The name of the error's constructor, for example ElementError.
    * This getter is inspired by https://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript#comment84156899_32750746
    *
    * @returns {string} - The error constructor name, either CustomError or some class extending CustomError
    */
   get name () { return this.constructor.name }

   /**
    * A method to rethrow an error. Stacktraces are from when the error was currently initialized
    * Derived from https://stackoverflow.com/a/42755876 by Matt
    */
   rethrow (message = this.message, ...args) {
      if (message === this.message) {
         this.stack = new this.constructor(message, ...args)
         throw this // eslint-disable-line no-throw-literal
      } else {
         const newError = new this.constructor(message, ...args)
         newError.originalError = this
         newError.stack = `${newError.stack}\n${this.stack}`
         throw newError
      }
   }
}

/** Represents an error involving an element. */
class ElementError extends CustomError {
   /**
    * @param {string} [message] - The error message to display in the console when thrown
    * @param {HTMLElement} [element = HTMLUnknownElement] - The element that was involved in the error
    */
   constructor (message, element = document.createElement('HTMLUnknownElement')) {
      super(message)
      this.element = element
   }
}

class NothingDisabledError extends CustomError {
   constructor (noun = 'Nothing', plural = `${noun}s`, message = `Cannot enable ${noun} since all ${plural} are already enabled.`) {
      super(message)
   }
}

class NothingEnabledError extends CustomError {
   constructor (noun = 'Nothing', plural = `${noun}s`, message = `Cannot disable ${noun} since all ${plural} are already disabled.`) {
      super(message)
   }
}

/**
 * @param {string} noun
 * @param {string} [condition] - Don't pass null
 */
class DisabledError extends CustomError {
   constructor (noun, condition = '') {
      if (condition.length !== 0) { condition = ` and ${condition}` }

      super(`${noun} is disabled${condition}.`)
   }
}

export class BotIsDisabledError extends DisabledError {
   constructor (bot) {
      super(bot.name, 'cannot play')
      this.bot = bot
   }
}

export class ElementIsDisabledError extends DisabledError {
   constructor (element, message = "shouldn't be changed") {
      super(element.tagName, message)
      this.element = element
   }
}

/** Abstract utility class */
class ElementAlreadyError extends ElementError {
   constructor (element, isAlreadyWhat) {
      super(`${element.tagName} element is already ${isAlreadyWhat}`, element)
   }
}

export class ElementIsAlreadyDisabledError extends ElementAlreadyError {
   constructor (element) {
      super(element, 'disabled')
   }
}

export class ElementIsAlreadyEnabledError extends ElementAlreadyError {
   constructor (element) {
      super(element, 'enabled')
   }
}

class ValueError extends CustomError {
   constructor (valueName = 'value identifier unprovided', message = `Invalid internal value! (${valueName})`) {
      super(message)
   }
}

class MaxValueError extends ValueError {
   constructor (message = 'Max value reached') {
      super(message)
   }
}

class SameValuesError extends ValueError {
   constructor (message = "Some values are the same when they shouldn't be") {
      super(message)
   }
}

export class DidntChangeError extends SameValuesError {
   constructor (message = 'Something "changed" to the same value') {
      super(message)
   }
}

// When the user does something the user isn't supposed to
class EvilPlayerError extends CustomError {
   constructor (message = 'hmmph') {
      super(message)
   }
}

// Only for constant non-default errors
export const ERRORS = {
   SQUARE_NOT_UPDATED: new ValueError('square', 'AAA WHAT!????'),
   INVALID_MOVE_FINISH: new ValueError('moveFinish'),
   IMPOSSIBLE_LAST_MOVE: new ReferenceError('Last move was not an option...?'),
   MAX_PLAYERS_REACHED: new MaxValueError('Max players reached'),
   EVERYONEs_ENABLED: new NothingDisabledError('person', 'people'),
   NO_ONEs_ENABLED: new NothingEnabledError('person', 'people'),
   EVIL_CLICK: new EvilPlayerError("Hey, you're not supposed to click that"),
   EVIL_CHANGE: new EvilPlayerError('How did you do that')
}

export const NOT_DONE_YET = "This feature is not finished yet. So it doesn't work"
