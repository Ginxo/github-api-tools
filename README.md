# github-api-tools

a bunch of tools to make github API retrieval a bit eaiser

## Instalation

Execute

`npm install -g @ginxo/github-api-tools`


## Execution

It is recommended to add `GITHUB_TOKEN` variable to your environment.

Just execute for more details

`github-api-tool -h`

### Example

To filter deliveries from `kiegroup` owner, between `2022-10-19T15:12:00Z` and `2022-10-19T15:14:00Z`

`github-api-tool -g kiegroup -p WHATEVER_URL -sd 2022-10-19T15:12:00Z  -ed 2022-10-19T15:14:00Z`

