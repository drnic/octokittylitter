# Octo Kitty Litter - GitHub Sandbox

* This is not the real GitHub. 
* It's a sample sandbox.
* An aide to integration testing.

Say you wanted to build a third party GitHub service that interacted
with either the Github APIs or the website itself, then you'd just
love to have a Sandbox - a fake Github site that behaved like Github
but you controlled the internal data.

[Octo Kitty Litter](http://github.com/drnic/octokittylitter) is that Sandbox.

Why "Octo Kitty Litter"? It's the Sandbox for Github's Octocat.

## Implemented Features

Currently, only the following features of GitHub have been implemented: 

* registration/login
* inbox/mail system

## Installation

This is a Rails app. Install it and run it however you want.

Ultimately, you'll probably want to launch the app before running integration tests
to a known port number. For example:

    cd path/to/octokittylitter && script/server -p 3030

Then during your integration tests, target `http://localhost:3030` instead of the normal `http://github.com`
you'd use during production.

## License

(The MIT License)

Copyright (c) 2009 [Dr Nic Williams](http://drnicwilliams.com/), [Mocra](http://mocra.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
