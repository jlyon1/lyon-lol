+++
title = "Kotlin Builders for Fun and Profit"
slug = "kotlin-builder"
date = 2023-02-19
draft = true
+++

I have been using Kotlin pretty often recently and have very much enjoyed working with the language. So much so that I will likely reach for it over Go for my next personal project. There are many ways in which Kotlin makes data transformations and concurrency simple without all of the verbosity often associated with Go. One of my favorite examples of this is the builder pattern.

Consider the following basic class:

```kt
class Person {
    var name: String = ""

    fun printName(){
        println(name)
    }
}
```

We could initialize it in several ways, but instead of going the traditional route of creating a constructor, we can instead create a builder. See the example below.

```kt
// Create our person builder
fun personBuilder(init: Person.() -> Unit): Person{
    val person = Person()
    person.init()
    return person
}


// Use the builder to create a new person

fun main() {
    personBuilder {
        name = "Joey"
    }.printName()
}
```

Let's break down what happened here. The block following `personBuilder {` in the main function is a lambda or anonymous function. `personBuilder` refers to the function declared above which takes a typed anonymous function as a parameter `init`. In the main function, we are calling personBuilder with the lambda function immediately following it.

Given `init` is of type `init: Person.() -> Unit`, a function with a person-typed receiver, it must be called on an instance of type person, and `this` within the function will refer to that person object. Now we can modify the parameters of the Person object within the lambda. Let's expand on this example a little bit by adding an outfit type to the person class.

```kt
class Outfit {
    var shirtColor: String = ""
    var pantsColor: String = ""

    fun printFit(){
        println("Shirt: ${shirtColor} Pants: ${pantsColor}")
    }
}

class Person {
    var name: String = ""
    var myOutfit: Outfit = Outfit()

    // Outfit Builder
    fun outfit(init: Outfit.() -> Unit): Outfit{
        val outfit = Outfit()
        outfit.init()
        this.myOutfit = outfit // once the Outfit is initilized we can use it to initialize myOutfit
        return outfit
    }

    fun printAll(){
        println(name)
        this.myOutfit.printFit()
    }
}

// Person Builder
fun person(init: Person.() -> Unit): Person{
    val person = Person()
    person.init()
    return person
}

fun main() {
    person {
        name = "Joey"
        outfit {
            shirtColor = "Red"
            pantsColor = "blue"
        }
    }.printAll()
}

// Output: 

/*
Joey
Red-blue
*/
```

By putting an outfit builder within the person class we can quickly initialize our objects without much verbosity at all and keep our code clean and readable. There's a cool example of this in the Kotlin docs [here](https://kotlinlang.org/docs/type-safe-builders.html#how-it-works)

I'll be writing more about Kotlin as I find cool new things to work with as a way to document and solidify my understanding.