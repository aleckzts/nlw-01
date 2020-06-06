# Ecoleta

Projeto Criado durante a Next Level Week 01 da Rocketseat.

Aplicativo de compartilhamento de pontos de coleta de recicláveis.

* Backend em Node JS ([server](server))
* Frontend em React ([web](web)) e React Native ([mobile](mobile))

## Como utilizar

* Baixe o repositório
```
git clone https://github.com/aleckzts/nlw-01.git
cd nlw-01
```

* Configure o background, criando o banco, tabela e carregando dados iniciais
```
cd server
npm run knex:migrate
npm run knex:seed
```

* Deixe o backend rodando
```
npm run dev
```

* Em outro terminal, execute o frontend web para cadastro dos pontos de coleta
```
cd web
npm start
```
* Acesso http://localhost:3000 e cadastre alguns pontos com Cidade, Estado e ponto no mapa

* Para rodar o app mobile para visualização dos pontos no mapa
```
cd mobile
npm start
```

* Instale o aplicativo [Expo](https://expo.io/) no celular e scaneie o QR Code apresentado no browser.
