## Directory structure

> The project is bootstrapped with `create-react-app` cli, with typescript extension.

- `src/index`: Entry point file for our application
- `src/App`: Components entry point with routing
- `src/utils`: Helpers
- `src/xhr`: XHR helpers
- `src/configureStore`: global state management configuration
- `src/types`: Types for application level like Redux State, Redux Actions etc
- `public`: Global assets like css, index.html, favicon, manifest etc
- `src/****`: Different modules (routes) in our application

## Contribution

1. System requirements

- `npm^6.7.0`

2. Knowledge requirements

- `typescript@3.3.3`: attach the typings to our codebase
- `react@16.8.2`: component library
- `@reach/router@1.2.1`: router for reach with accessibility in mind
- `redux@4.0.1`: state management
- `react-redux@6.0.1`: state management helper for react
- `redux-thunk`: side effects for redux actions
- `formik`: form state management
- `yup`: data validation
- `axios`: helper for xhr
- `@tourepedia/ui`: ui component library for tourepedia
- `commitizen`: craft your commit message with proper attributes

2. Clone the repository and install the dependencies

```bash
git clone git@github.com:tourepedia/tp-admin-ui.git
cd tp-admin-ui
npm install
npm start
```

## Scripts

```bash
npm start # to start the development server
npm run test # to run the unit tests
npm run cypress # to run any E2E tests
npm run cypress:all # to run all E2E tests
npm run commit # to commit the changes
npm run release # to release a new version, make sure to have a personal token in your .env file
```

## HOW TO?

### Q: How to add a new module ?

Let's support we are creating a new Module called `Role Management`. This module will have following functionalities:

- Show list of items
- Show details for an item
- Create a new item

> You can look into the `src/Roles` directory for reference.

We will start by creating a new Folder inside `src` directory, named `Roles` with a `index.tsx` file in it which will
contain all the exports from Roles management module.
