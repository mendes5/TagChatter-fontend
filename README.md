# Implementação do Front-end TagChatter

Apenas tenha certeza de estar em um navegador webkit moderno com suporte a javascript ES6 e ir no link:

https://cold-meson-06.github.io/TagChatter

E é só isso...

Caso não funcione pode ser que o servidor tenha fechado, então você pode clonar o repositorio, e se tiver Node.js hospedar um servidor http na pasta do repositorio clonado, e abrir na localhost:

```
http-server -p8000 -o
```

Caso não tenha o módulo pode encontrá-lo [neste link](https://www.npmjs.com/package/http-server). 

Mas ainda não temos o server, para resolver este problema você pode ir no [index.html](https://github.com/Cold-Meson-06/TagChatter-fontend/blob/master/index.html#L85) e ativar o modo de teste:

```html
<script>TESTING_ENABLED=true</script>
```

E você terá uma simulação do servidor rodando. 
A simulação *não* implementa os requisitos do projeto como atualização a cada 3 segundos e falha intencional de 25% de chance, a própia simulção não está nos requisitos. Porêm seria trivial adicionar tal funcionalidade.
