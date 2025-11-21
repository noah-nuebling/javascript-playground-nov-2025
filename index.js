console.log("hellohellohellooo");
import { renderComponentStuff } from "./render-component-stuff.js";
import { renderInteractiveStuff } from "./render-interactive-stuff.js";

if (1) {
  document.body.innerHTML += `
        <style>
            body {
                font-family: sans-serif;
            }
        </style>
        ${renderComponentStuff()}
    `;
}

/// OOP with inheritance using low-level prototype-inheritance primitives, instead of the `new` or `class` features.
//      (Those are syntax sugar / abstractions around the same thing as far as I understand.)
/// Supports JSDoc/autocomplete pretty nicely as well.
/// Probably won't use this since I don't really plan to do inheritance. More of a learning experience.
/// [Nov 2025]
if (1) {
  /**
   * @template T
   * @param {T} proto
   * @returns {T}
   */
  function alloc(proto) {
    // When defining as Object.proto.alloc(), JSDoc type-inference breaks. [Nov 2025]
    return { __proto__: proto };
  }

  /** @typedef {{
   *      name: string,
   *      eat: () => void
   * }} Animal */
  let AnimalProto = {
    /** @returns {Animal} */
    init(name) {
      this.name = name;
      return this;
    },
    eat() {
      console.log(this.name + " eats!");
    },
  };

  /** @typedef {{
   *      breed: string,
   *      isGoodBoy: boolean,
   * } & Animal} Dog */
  let DogProto = {
    __proto__: AnimalProto,

    /** @returns {Dog} */
    init(name, breed) {
      AnimalProto.init.call(this, name); // Init super
      this.breed = breed;
      this.isGoodBoy = true;
      return this;
    },
    bark() {
      console.log(this.name + " barks!");
    },
  };

  let dog = alloc(DogProto).init("Hans", "Golden Retriever");

  console.log(`tha dawg: ${dog.name} | ${dog.breed}`);
  dog.bark();
  dog.eat();
}
// Equivalent OOP structure using `class` feature.
//      -> This is a bit easier and the JSDoc type inference needs less help.
if (1) {
  class Animal {
    /**
     * @param {string} name
     */
    constructor(name) {
      this.name = name;
    }

    eat() {
      console.log(this.name + " eats!");
    }
  }

  class Dog extends Animal {
    /**
     * @param {string} name
     * @param {string} breed
     */
    constructor(name, breed) {
      super(name); // Calls parent constructor
      this.breed = breed;
      this.isGoodBoy = true;
    }

    bark() {
      console.log(this.name + " barks!");
    }
  }

  let dog = new Dog("Hans", "Golden Retriever");

  console.log(`tha dawg: ${dog.name} | ${dog.breed}`);
  dog.bark();
  dog.eat();
}

if (1) {
  const html = (strings, ...values) => {
    /* Helper for lit-html / lit-plugin ... */
    return strings.map((str, i) => str + (values[i] ?? "")).join("");
  };

  let interp = "TEMPLOITE STROINGS";

  document.body.innerHTML += `
        <div>
            <style> @scope {
                * {
                    color: oklch(100% 100% 180);
                }
            } </style>
            <h1 style="display: flex;">
                DA ${interp} ARE OUTTA
            </h1>
            <p >
                CONTROLL
            </p>
        </div>
        <a href="https://google.com"></a>
        <p> llll </p>
    `;
}

if (1) {
  document.body.innerHTML += renderInteractiveStuff();
}
