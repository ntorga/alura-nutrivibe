/// <reference path="../pb_data/types.d.ts" />

const openCodeGoApiKey = $os.getenv("OPENCODE_GO_API_KEY");

if (!openCodeGoApiKey) {
  console.warn("OPENCODE_GO_API_KEY is not set. Photo meal registration will not work.");
}
