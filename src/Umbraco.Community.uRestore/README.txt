== Requirements ==
* Node LTS Version 22+
* Use a tool such as NVM (Node Version Manager) for your OS to help manage multiple versions of Node

== Node Version Manager tools ==
* https://github.com/coreybutler/nvm-windows
* https://github.com/nvm-sh/nvm
* https://docs.volta.sh/guide/getting-started

== Steps ==
* Open a terminal inside the `\Client` folder
* Run `npm install` to install all the dependencies
* Run `npm run build` to build the project
* The build output is copied to `wwwroot\App_Plugins\UmbracoCommunityuRestore\umbraco-community-u-restore.js`

== File Watching ==
* Add this Razor Class Library Project as a project reference to an Umbraco Website project
* From the `\Client` folder run the command `npm run watch` — this will monitor changes to *.ts files and rebuild
* With the Umbraco website project running, the Razor Class Library Project will refresh the browser when the build completes

== Regenerating the API client ==
* Start the test site: `cd ..\Umbraco.Community.uRestore.TestSite && dotnet run`
* From the `\Client` folder run: `npm run generate-client`
* This regenerates `src/api/` from the live Swagger spec at https://localhost:44345/umbraco/swagger/umbracommunityurestore/swagger.json

== Suggestion ==
* Use VSCode as the editor of choice — it has good tooling support for TypeScript and recommends the Lit plugin for Web Component completions

== Other Resources ==
* Umbraco Docs - https://docs.umbraco.com/umbraco-cms/customizing/overview
* UUI Component Library - https://uui.umbraco.com
