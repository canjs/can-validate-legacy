@page contributing-guide Contributing Guide
@parent can-validate-plugin
# Contribution Guide

## Issues

The repository uses Github Issues to track changes and requirements. Github issues is a great tool as you can comment and communicate around a specific topic.

### Using Issues

- Be as detailed as possible with comments and descriptions.
- A picture (or motion capture) is worth a thousand words. :)
- Try your best to keep an issue updated and accurate.
- If you are working on a task, assign it to yourself.
- Utilize labels to categorize the issue for others to understand it's state

### Creating an Issue

Use Github Issues to discuss or flag a feature or a bug. In a discussion issue, we can close it once a decision is made and create a new issue for the decided upon solution.

Try to be as descriptive as possible in the issue. Features should have as many requirements as possible. Features should use the [Gherkin syntax](https://github.com/cucumber/cucumber/wiki/Gherkin) whenever possible. This helps verify requirements are correct.

In addition, for **bugs**, include a [LiceCap](http://www.cockos.com/licecap/) screencapture of the bug, if possible. Also include reproduce steps or a url (if applicable).

> There is no such thing as a stupid question!

**Comment on issues.** If you feel it is important, then say something. Issues can serve as documentation and a learning tool, as much as it is also a tracking tool. So, asking a question, even if you feel it simple, can help others learn.

### Resolving issues

Issues should only be closed in conjunction with a pull request or a specific label:
- Won't Fix
- Duplicate

Make sure to always include a descriptive comment when closing an issue.

Comments, in general, should avoid simple remarks like "Closing issue" or "Fixed bug". Be descriptive.

## Docs

The tech stack includes [DocumentJS](http://documentjs.com/) which is a great tool that builds an HTML site from doc blocks in the code and from markdown files as well.

Keeping the documentation up to date is important for others to complete items effectively. Changing an api or creating a new component can help someone else complete a task but only if they are aware of its existence and how to implement it.

TODO: Include documentation rules and examples

To build docs, run: `npm run docs`. This executes the documentation build script (it essentially just runs DocumentJS).

## Tests

The tech stack includes [Qunit](https://qunitjs.com/) for running tests. Using [StealJS](http://stealjs.com/) to package the modules, we can run tests easily in the browser with a simple configuration.

To run tests in a browser, run: `npm run develop`. This starts a web server on the root folder. You can then browse to the individual test.html files in the file structure.

TO run tests in the console, run: `npm run tests`. This runs tests using [Testee](https://github.com/bitovi/testee) and will open supported browsers or PhantomJS.

## Code

Since this is a plugin for [CanJS](http://canjs.com/), the repo attempts to follow a specific structure to match the location of core components in the CanJS framework:

- can-validate
 - map
 - shims
 - validations

Each script should include the following:

- A working demo
- Documentation that renders when docs are built
- Passing tests

### Cloning, git-flow

To get a copy of the code base, create a folder and clone the project using `git`. Branch from `master` or `minor` depending on what the issue is. Always work from a feature branch. Create branches that follow the [git-flow](http://nvie.com/posts/a-successful-git-branching-model/) concepts.

### Setting up local server

The tech stack includes [StealJS](http://stealjs.com/) which is a module loader, among other things. Demos and the main index file will load Steal and compile the app on the fly. To run a local server simply run: `npm run develop`. Opening a browser to the resulting port, something like `localhost:3000` should open almost immediately.

### Creating a Pull Request

Before opening a PR, make sure you verify your code. Run `npm run build`. This runs tests, a linting tool, and the build script. Verying that the entire script completes without errors will save you time.

Once verified, push your code to your feature/bug branch and create the pull request. Your pull request should always merge into `minor` unless otherwise specified.  The `minor` branch is merged into `master` concurrently with a release.

### Updating changelog

Please keep the changelog updated. [This is a good place to start with adding to the changelog](http://keepachangelog.com/).
