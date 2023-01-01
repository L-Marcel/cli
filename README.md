<div valing="top">
  <h1>l-marcel: <span>cli</span></h1>
  <p>Minha própria CLI para administrar meus projetos.</p>
  <nav>
    <div id="repository-buttons"/>
    <a class="navigation-link disabled" href="https://github.com/L-Marcel/cli/blob/master/README.en-US.md" target="__blank__">
      en-us
    </a>
    <span class="disabled">•</span>
    <a class="navigation-link" href="https://www.npmjs.com/package/@lmarcel/cli" target="__blank__">
      npm
    </a>
  </nav>
</div>

<br/>

<p>Para usar, você precisa ter instalado o <a href="https://cli.github.com/" target="__target__">GitHub CLI</a>! Depois, você pode instalar executando o comando:</p>
<pre>
<span>npm</span> i -g @lmarcel/cli
</pre>

<h2>Comandos:</h2>
<pre>
login [options]                          | entrar com o github, é necessário
logout [hostname]                        | sair da conta do github
status [hostname]                        | checar sua autenticação
create [options] [name] [formattedName]  | criar um novo projeto e clonar o repositório
clone &lt;name> [path]                      | clonar um repositório do github
push &lt;message> [dir]                     | cria um commit e envia TODAS as alterações
help [command]                           | mostra as informações auxiliares dos comandos
</pre>