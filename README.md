# CineReviews

Projeto React + Vite preparado para deploy no GitHub Pages.

## Rodando localmente

1. Instale as dependencias:

```powershell
npm install
```

2. Preencha o arquivo `.env`:

```env
VITE_TMDB_API_KEY=sua_chave_aqui
```

3. Rode o projeto:

```powershell
npm.cmd run dev
```

## Deploy no GitHub Pages

URL esperada:

- `https://jv-gb.github.io/cine-reviews/`

Passos no GitHub:

1. Va em `Settings > Secrets and variables > Actions`.
2. Crie um secret chamado `VITE_TMDB_API_KEY`.
3. Cole sua chave do TMDB nesse secret.
4. Va em `Settings > Pages`.
5. Em `Source`, selecione `GitHub Actions`.
6. Faca push na branch `main`.

O workflow de deploy esta em `.github/workflows/deploy-pages.yml`.

## Observacao importante

Como a chave e usada em um app frontend, ela vai para o bundle do navegador mesmo quando vem de secret do GitHub Actions. O secret evita versionar a chave no repositorio, mas nao transforma a chave em segredo real no cliente.
