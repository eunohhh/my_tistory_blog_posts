<pre id="code_1741169337848" class="javascript" data-ke-language="javascript" data-ke-type="codeblock"><code>{
    "key": "alt+cmd+-",
    "command": "HookyQR.beautify"
  },
  {
    "key": "shift+\\",
    "command": "inlineChat.start",
    "when": "editorFocus &amp;&amp; inlineChatHasProvider &amp;&amp; !editorReadonly"
  },
  {
    "key": "cmd+i",
    "command": "-inlineChat.start",
    "when": "editorFocus &amp;&amp; inlineChatHasProvider &amp;&amp; !editorReadonly"
  },
  {
    "key": "cmd+r i",
    "command": "-inlineChat.start",
    "when": "editorFocus &amp;&amp; inlineChatHasProvider &amp;&amp; !editorReadonly"
  },
  {
    "key": "cmd+i",
    "command": "-workbench.action.terminal.chat.start",
    "when": "terminalChatAgentRegistered &amp;&amp; terminalFocusInAny &amp;&amp; terminalHasBeenCreated || terminalChatAgentRegistered &amp;&amp; terminalFocusInAny &amp;&amp; terminalProcessSupported"
  },
  {
    "key": "'",
    "command": "workbench.action.terminal.chat.focusInput",
    "when": "terminalChatFocus &amp;&amp; !inlineChatFocused"
  },
  {
    "key": "cmd+i",
    "command": "-workbench.action.terminal.chat.focusInput",
    "when": "terminalChatFocus &amp;&amp; !inlineChatFocused"
  },
  {
    "key": "cmd+i",
    "command": "-workbench.action.chat.stopListeningAndSubmit",
    "when": "inChatInput &amp;&amp; voiceChatInProgress &amp;&amp; scopedVoiceChatInProgress == 'editor' || inChatInput &amp;&amp; voiceChatInProgress &amp;&amp; scopedVoiceChatInProgress == 'inline' || inChatInput &amp;&amp; voiceChatInProgress &amp;&amp; scopedVoiceChatInProgress == 'quick' || inChatInput &amp;&amp; voiceChatInProgress &amp;&amp; scopedVoiceChatInProgress == 'terminal' || inChatInput &amp;&amp; voiceChatInProgress &amp;&amp; scopedVoiceChatInProgress == 'view' || inlineChatFocused &amp;&amp; voiceChatInProgress &amp;&amp; scopedVoiceChatInProgress == 'editor' || inlineChatFocused &amp;&amp; voiceChatInProgress &amp;&amp; scopedVoiceChatInProgress == 'inline' || inlineChatFocused &amp;&amp; voiceChatInProgress &amp;&amp; scopedVoiceChatInProgress == 'quick' || inlineChatFocused &amp;&amp; voiceChatInProgress &amp;&amp; scopedVoiceChatInProgress == 'terminal' || inlineChatFocused &amp;&amp; voiceChatInProgress &amp;&amp; scopedVoiceChatInProgress == 'view'"
  },
  {
    "key": "cmd+i",
    "command": "-workbench.action.chat.startVoiceChat",
    "when": "chatIsEnabled &amp;&amp; hasSpeechProvider &amp;&amp; inChatInput &amp;&amp; !chatSessionRequestInProgress &amp;&amp; !editorFocus &amp;&amp; !notebookEditorFocused &amp;&amp; !scopedVoiceChatGettingReady &amp;&amp; !speechToTextInProgress &amp;&amp; !terminalChatActiveRequest || chatIsEnabled &amp;&amp; hasSpeechProvider &amp;&amp; inlineChatFocused &amp;&amp; !chatSessionRequestInProgress &amp;&amp; !editorFocus &amp;&amp; !notebookEditorFocused &amp;&amp; !scopedVoiceChatGettingReady &amp;&amp; !speechToTextInProgress &amp;&amp; !terminalChatActiveRequest"
  },
  {
    "key": "cmd+i",
    "command": "-composer.startComposerPrompt",
    "when": "composerIsEnabled"
  },
  {
    "key": "cmd+k",
    "command": "-composer.startComposerPrompt",
    "when": "composerIsEnabled"
  },
  {
    "key": "cmd+r f",
    "command": "-workbench.action.closeFolder",
    "when": "emptyWorkspaceSupport &amp;&amp; workbenchState != 'empty'"
  },
  {
    "key": "cmd+q",
    "command": "-workbench.action.quit"
  },
  {
    "key": "cmd+q",
    "command": "workbench.files.action.collapseExplorerFolders"
  }</code></pre>