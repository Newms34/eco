#Ecology Simulation
>Some exploration of basic concepts in ecology, including food web balance!

## Contents

- [About](#about)
- [Installing and Using](#installing-and-using)
- [Author](#author)
- [License](#license)

## About

We're basically using dynamically created divs (one for each 'organism') that have the following behaviors (note that, largely, none of these rules apply for producers (plants):
 
 - An organism is either in 'rand' mode, where it basically just bounces around the viewport, 'mate' mode, where it seeks another of its kind, or 'pred' mode, where it seeks out a relevent prey item.
 
 - Organisms in 'mate' and 'pred' mode have a target, which they attempt to get close to
 
 - If the organism gets within 10px of its target, it either produces another organism of its type (in 'mate' mode), or destroys that organism ('pred' mode).

 - Both predation and mating have a chance to fail.

 - Organisms must complete a successful 'pred' within a certain time period or they will starve.

The 'game' ends if all members of any specific group die off. 

## Installing and Using

This app is a simple front-end app. Hey, it's not even really an app. But if you wanna use it:
###Installation
1.) Download/clone it to your local machine:
```git clone https://github.com/Newms34/eco.git```

2.) Open ecosim.html. Seriously, that's it as far as installation. And here you were expecting some fancy install procedure, right?

###Usage

1.) Enter your number of organisms when prompted. 

2.) Sit back and watch the mayhem!

##Author
* __David Newman__ - [LinkedIn](https://www.linkedin.com/in/newms34) | [GitHub](https://github.com/Newms34)

## License

This projected is licensed under the terms of the [MIT license](http://opensource.org/licenses/MIT)
