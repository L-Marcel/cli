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
login [options]                          | login with github, it's required
logout [hostname]                        | logged out of github account
status [hostname]                        | check your authentication state
create [options] [name] [formattedName]  | create a new project and clone the repository
clone &lt;name> [path]                      | clone a github repository
push &lt;message> [dir]                     | create a commit and push ALL changes
help [command]                           | display help for command
</pre>