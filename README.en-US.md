<div valing="top">
  <h1>l-marcel: <span>cli</span></h1>
  <p>My own CLI to manage my projects.</p>
  <nav>
    <div id="repository-buttons"/>
    <a class="navigation-link disabled" href="https://github.com/L-Marcel/cli/blob/master/README.md" target="__blank__">
      pt-br
    </a>
    <span class="disabled">•</span>
    <a class="navigation-link" href="https://www.npmjs.com/package/@lmarcel/cli" target="__blank__">
      npm
    </a>
  </nav>
</div>

<br/>

<p>To use you need to install the <a href="https://cli.github.com/" target="__target__">GitHub CLI</a>! After, you can install running:</p>
<pre>
<span>npm</span> i -g @lmarcel/cli
</pre>

<h2>Commands:</h2>
<pre>
<code>
<span>login</span> [options]                          | login with github, it's required
<span>logout</span> [hostname]                        | logged out of github account
<span>status</span> [hostname]                        | check your authentication state
<span>create</span> [options] [name] [formattedName]  | create a new project and clone the repository
<span>clone</span> &lt;name> [path]                      | clone a github repository
<span>push</span> &lt;message> [dir]                     | create a commit and push ALL changes
<span>help</span> [command]                           | display help for command
</code>
</pre>