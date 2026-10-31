# Historicar

Sistema para a oficina registrar o histórico de manutenção de cada automóvel (carro, moto, caminhão…) e gerar um
**QR code fixo** para colar no para-brisa. Quem escaneia vê o histórico atualizado e pode
baixar um PDF.

- **Painel do mecânico** (`/painel`, com login): cadastra automóveis e anotações (data, km, lista
  de serviços, observações e próxima revisão).
- **Página pública** (`/v/<código>`): é o que o QR abre. Mostra o histórico em linha do tempo,
  com pesquisa e um botão para baixar o PDF.
- **PDF** (`/v/<código>/pdf`): gerado na hora com os dados atuais do banco.

Stack: Next.js 16 (App Router) + MongoDB, hospedável de graça na Vercel com o MongoDB Atlas
(plano M0).

## Como o QR fica fixo

O QR guarda só um link, como `https://historicar.vercel.app/v/9n6hvqmcar`. Esse código é gerado
uma vez no cadastro do automóvel e nunca muda. A página busca os dados no banco a cada acesso,
então dá para adicionar e editar anotações à vontade sem reimprimir o adesivo.

Cuidados:

- **O endereço do site também faz parte do QR.** Defina `APP_URL` com o endereço definitivo
  antes de imprimir adesivos de verdade. Se o site mudar de endereço, os QRs já colados param
  de abrir.
- **Excluir um automóvel quebra o QR dele.** O painel avisa antes de excluir.
- A página pública não mostra o nome e o telefone do dono, nem quem fez cada serviço.
  Qualquer pessoa que escanear o para-brisa consegue abrir essa página.

## Tipos de usuário

| Ação                               | Mecânico | Mecânico mestre |
| ---------------------------------- | :------: | :-------------: |
| Ver automóveis e histórico         |    ✔     |        ✔        |
| Cadastrar automóvel                |    ✔     |        ✔        |
| Criar anotação                     |    ✔     |        ✔        |
| Editar/excluir automóvel           |          |        ✔        |
| Editar/excluir qualquer anotação   |          |        ✔        |
| Criar e desativar usuários         |          |        ✔        |
| Trocar a própria senha             |    ✔     |        ✔        |

As regras ficam todas em [src/lib/permissions.ts](src/lib/permissions.ts). Ninguém troca a senha
de outra pessoa pelo painel: quem esquecer a senha é recuperado pelo script `criar-mestre`
(veja abaixo).

## Usando no celular

O painel foi feito para usar no celular, na hora do serviço. Dá para instalar como um app, que
abre em tela cheia e com ícone próprio (precisa do site já no ar, com `https`):

- **Android (Chrome):** abra o painel, toque no menu **⋮** e em **Instalar app** (ou
  **Adicionar à tela inicial**).
- **iPhone (Safari):** abra o painel, toque em **Compartilhar** e em **Adicionar à Tela de
  Início**.

## Rodando localmente

Precisa do **Node 20 ou mais novo** (o projeto tem `.nvmrc`; com nvm: `nvm use 20`).

```bash
npm install
cp .env.example .env.local      # depois preencha o .env.local
npm run criar-mestre -- "Seu Nome" seuusuario suasenha
npm run dev
```

Acesse http://localhost:3000 e entre com o usuário criado.

O comando `criar-mestre` também recupera o acesso de quem esqueceu a senha: rodando com um
usuário que já existe, ele define a nova senha e reativa o usuário, sem mudar o cargo.

## Variáveis de ambiente

| Variável         | Para que serve                                                                 |
| ---------------- | ------------------------------------------------------------------------------ |
| `MONGODB_URI`    | String de conexão do MongoDB Atlas                                             |
| `MONGODB_DB`     | Nome do banco (padrão `historicar`)                                    |
| `SESSION_SECRET` | Segredo do login, com no mínimo 32 caracteres aleatórios                       |
| `APP_URL`        | Endereço definitivo do site, sem barra no final. É o que vai dentro do QR      |
| `SHOP_NAME`      | Nome da oficina (painel, página pública, adesivo e PDF)                        |
| `CRON_SECRET`    | Só na Vercel: protege a tarefa diária que mantém o banco ativo (`/api/saude`)  |

Para gerar o `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Colocando no ar (de graça)

### 1. MongoDB Atlas

1. Crie uma conta em https://www.mongodb.com/cloud/atlas e um cluster **M0 (Free)**.
2. Em **Database Access**, crie um usuário com senha.
3. Em **Network Access**, libere `0.0.0.0/0`. A Vercel não tem IP fixo, então é preciso
   liberar todos os IPs; o acesso continua protegido pelo usuário e senha do banco.
4. Em **Connect > Drivers**, copie a string de conexão para usar no `MONGODB_URI`.

### 2. Vercel

1. Suba o projeto para um repositório no GitHub.
2. Em https://vercel.com, importe o repositório.
3. Mantenha o nome do projeto como **`historicar`**: ele vira o endereço
   (`historicar.vercel.app`) que vai dentro dos QRs. Se a Vercel disser que o nome já está em
   uso, escolha outro antes de imprimir qualquer adesivo.
4. Em **Settings > Environment Variables**, cadastre todas as variáveis da tabela acima, com
   `APP_URL=https://historicar.vercel.app`.
5. Faça um novo deploy para as variáveis valerem.
6. Crie o primeiro usuário mestre rodando `npm run criar-mestre` na sua máquina, com o
   `.env.local` apontando para o mesmo `MONGODB_URI` do Atlas.

O plano grátis da Vercel (Hobby) é só para uso não comercial. Se a oficina passar a usar de
verdade, o caminho é o plano pago ou outra hospedagem. Nesse caso, ter um domínio próprio
(ex.: `historico.oficinadoze.com.br`) desde o começo permite trocar de hospedagem sem quebrar
os QRs.

## Estrutura

```
src/
  app/
    login/                 tela de login
    painel/                área do mecânico (automóveis, anotações, QR, usuários)
      actions.ts           todas as ações que gravam no banco (Server Actions)
    v/[code]/              página pública que o QR abre
      pdf/route.ts         PDF gerado na hora
  components/              formulários, linha do tempo, placa, ícones
  lib/
    auth.ts                sessão e usuário logado
    data.ts                consultas ao banco
    db.ts                  conexão com o MongoDB e índices
    form.ts                validação dos formulários
    pdf.ts                 montagem do PDF
    permissions.ts         quem pode fazer o quê
  proxy.ts                 bloqueia /painel para quem não está logado
scripts/criar-mestre.mjs   cria um mestre ou recupera o acesso de quem esqueceu a senha
```
