![Weacle Speed Example](https://weacle.nyc3.cdn.digitaloceanspaces.com/static/github/weacle-speed-example-2-1500x921.webp)

# Weacle Speed

An open-source AI powered app to help code faster.
Ask an LLM to do some work with your files. 

1. Select the files and directories to include in your prompt.
2. Write a prompt.

## Get started

1. Download the project
2. At the root of the repo, create an `.env` file with the following variables and specify the desired ports:
```
SERVER_PORT=4300
SERVER_WATCHER_PORT=4302
VITE_CLIENT_PORT=4301
VITE_SERVER_PORT=4300
```
In `speed/server/node`, create an `.env` file with the following variables:
```
ANTHROPIC_API_KEY
MONGODB_URI
OPENAI_API_KEY
PINECONE_API_KEY
PINECONE_INDEX_NAME
```
3. Start the client by running the command `yarn dev-client`
4. Start the server with `yarn dev-server`, and the watcher with `yarn dev-watcher`
5. Open the client page in your browser and create a new project.
6. Set the system prompt. Learn more in the System Prompt section.
7. In the settings, specify the files and paths to include or exclude. You can initiate file indexing from the settings, it will be used for the file search.
8. The directory panel should list the project folders and files. Select the ones you want to include in the prompt.
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
- NodeJs, ViteJs, React
- MongoDB, Pinecone, OpenAI, Anthropics API

## About the models used
Models used are `claude-3-5-sonnet`(default), `gpt-4o` and `gpt-4o-mini`.

## Author
• Carl Brenner [@carlbrn](https://github.com/carlbrn)

## License
Licensed under the MIT License, Copyright © 2024-present Weacle.
See  [LICENSE](https://github.com/AtWeacle/speed?tab=MIT-1-ov-file) for more information.
