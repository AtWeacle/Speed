
# Weacle Speed

An open-source AI app to help you code faster.
Ask an LLM to do some work with your files. 

1. Select the files and directories to include in your prompt.
2. Write the prompt.

## Get started

1. Download the project
2. At the root of the repo, create an `.env` file with the following variables and specify the desired ports:
```
SERVER_PORT=4300
VITE_CLIENT_PORT=4301
VITE_SERVER_PORT=4300
```
3. Start the client by running the command `yarn dev-client`
4. Start the server with `yarn dev-server`
5. Open the client page in your browser and set the system prompt. Learn more in the System Prompt section.
6. Add the project directory path, press `enter`.
7. In the settings, specify the files and paths to include and exclude.
8. The directory panel should list folders and files. Select the ones you want to include in the prompt.
9. Type your prompt, send it, enjoy!

## Example of system prompt
You are an experienced software engineer. You write code in typescript.
When you write code encapsulate it in a markdown code tag with the name of the code language.
You only write the required code. Don't explain. Don't write comments. Unless asked to do so.
Don't write the breakdown of changes.
Don't write the list of changes.

Organize your answer by files.

When writing code:
- Use indent of size space x2

When writing javascript and typescript code:
- Don't write semicolon at the end of each line for javascript and typescript code
- Prefer using function instead of arrow function for named functions
- Use type instead of interface for defining types

Very important: When writing code don't rewrite code that didn't change. Instead add the mention "Code not changed" where the code is the same.
Only write the code that is different from the existing code.

The server code is a nodejs, express server with mongoose in typescript.
The client code uses react, nextjs, zod in typescript.

## Tech Stack
The project uses:
- Yarn 4 ([how to install](https://yarnpkg.com/getting-started/install))
- Node server, ViteJs + React

## About the models used
Models used are `claude-3-5-sonnet-20240620`(default), `gpt-4o-2024-08-06` and `gpt-4o-mini`.
The temperature is 0.
Max token is 4096.
Prompt caching with Claude 3.5 is not added yet.

## Author
• Carl Brenner [@carlbrn](https://github.com/carlbrn)

## License
Licensed under the MIT License, Copyright © 2024-present Weacle.
See  [LICENSE](https://github.com/AtWeacle/speed?tab=MIT-1-ov-file) for more information.
