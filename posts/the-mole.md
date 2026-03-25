---
title: Diffusing bombs and cyclic groups
date: 2026-03-24
tags: television, math
---
_Apologies for not using LaTex for the math notation. Haven't figured out how to do that yet._  

Reality television gets a bad wrap for being brain-rot content, but while binging Netflix's _The Mole_ one of the challenges required the contestants to weigh exactly 6 liters from a 9L and 4L container.  

The team that came up with the solution first were contestants who initially didn't seem to get along, maybe due to clashing personalities. The challenge clearly helped them bond, which affirms a suspision I've had for a while now that conflict/confrontation can ironically build stronger bonds than purely "friendly" interactions.  

![unlikely-duo](./unlikely-duo-phoneshot.jpg)

My initial solution was fill both up twice to get 26L, then pour out 20L using the 4L jug to get to 6L.  

So _(9 * 2 + 4 * 2) - 4 * 5 = 9 * 2 + 4 * (2 - 5) = 6._  

Linear Diophantine equations are of the form _ax + by = c_, and in this case we're interested in integer solutions _x_ and _y_ for the equation _9x + 4y = 6_, assuming one exists. We already found _x = 2_, _y = -3_ by trial-and-error, and physically that would be represented as filling up the 9L jug twice, then from that amount emptying out 4L three times.  

Irrelevant though interesting is that there's an identity that says for integers _a_, _b_, there exist integers _x_,_y_ such that _ax + by = gcd(a,b)_. And since _gcd(9,4) = 1_, you're guaranteed a solution to _9x + 4y = 6_ since it's just the identity multiplied by 6 on both sides of the equation.  

There was a constraint though that there was no where to "stash" water, and any water that was kept had to be in one of the two containers.  

The solution then was to fill up the 9L jug, empty out 8L using the 4L jug, transferring the left over 1L into the 4L jug, filling up the 9L jug, then filling up the 4L jug by emptying out 3L from the 9L jug, leaving you with 6L. So starting from a full 9L jug, you go from 9L -> 5L -> 1L -> 6L.    

That led me to consider how things change if instead of a 4L jug we had a 5L jug. Since _gcd(9,5)_ is still 1, there's some intuition that a solution might exist. You can use the same strategy as before to go from 9L -> 4L -> 8L -> 3L -> 7L -> 2L -> 6L. Seeing this is when it clicked that this might have something to do with cyclic groups in algebra.   

It's been years since I thought about this stuff so I needed ChatGPT to help me iron out the details, but the group integers modulo _n_ for any integer _n_ is a cyclic group under addition, such that all integers coprime _p_ to _n_ (i.e. where _gcd(n,p) = 1_) are generators. A generator is a single element in the group that in conjunction with some operation can reduce to every other element in the group. Since 5 is coprime to 9 and thus a generator of integers modulo 9, you can start at 9 liters and get to every other liter-age between 1 and 9 by repeated iterations of removing 5 liters in a "cyclic" manner (i.e. instead of pouring "negative" liters from an empty 9L jug, you simply refill it).  

With this insight you can be fairly certain that this strategy of emptying the larger jug in increments of the smaller jug would work for a wide range of parameters. Might be a fun/cruel interview problem to weed out the math nerds ;P 


