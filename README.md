# MAR T-Shirts Store 💜

Loja virtual responsiva para camisetas infantis, com catálogo, carrinho, finalização pelo WhatsApp, painel administrativo e integração preparada para Supabase.

## Tecnologias
- HTML5, CSS3 e JavaScript
- Supabase: Database, Auth e Storage
- Netlify: hospedagem
- Google Fonts: DM Sans e Playfair Display

## Estrutura
```text
mar_tshirts_store/
├── index.html
├── admin.html
├── css/style.css
├── js/config.js
├── js/app.js
├── js/admin.js
├── assets/images/
├── supabase/schema.sql
├── netlify.toml
└── README.md
```

## 1. Testar localmente
Abra a pasta no VS Code e use a extensão Live Server para abrir `index.html`. Também pode usar um servidor local simples. Evite abrir diretamente por `file://`, pois módulos e integrações podem ter restrições.

Sem configurar Supabase, a loja mostra produtos demonstrativos para visualizar o layout. O painel administrativo exige Supabase configurado.

## 2. Configurar Supabase
1. Crie um projeto em https://supabase.com.
2. No SQL Editor, execute todo o conteúdo de `supabase/schema.sql`.
3. Em Storage, crie dois buckets **públicos**: `products` e `site-assets`.
4. Configure as políticas de Storage: leitura pública e gravação/alteração/exclusão somente para usuários autenticados. Não deixe gravação pública.
5. Em Authentication > Users, crie o usuário da Carol com e-mail e senha. Não habilite cadastro público.
6. Em Project Settings > API, copie a Project URL e a chave `anon`/publishable.
7. Cole esses dois valores em `js/config.js`.
8. Ajuste o número de WhatsApp no formato internacional, apenas números: `5573998211690` (confirme com a loja antes de publicar).

**Segurança:** nunca use a chave `service_role` no navegador. A política SQL de produtos permite que qualquer usuário autenticado gerencie o catálogo; por isso, mantenha a criação de contas fechada e crie somente usuários administradores confiáveis. Para uma operação com mais funcionários, implemente tabela de perfis e autorização por função.

## 3. Configurar buckets do Storage
Os buckets devem se chamar exatamente:
- `products`
- `site-assets`

Marque-os como públicos para que as imagens cadastradas possam aparecer na vitrine. As regras de upload e exclusão devem exigir usuário autenticado. Exemplo de políticas (execute após criar os buckets):

```sql
create policy "Public read product images" on storage.objects
for select to public using (bucket_id in ('products','site-assets'));

create policy "Authenticated upload product images" on storage.objects
for insert to authenticated with check (bucket_id in ('products','site-assets'));

create policy "Authenticated update product images" on storage.objects
for update to authenticated using (bucket_id in ('products','site-assets'))
with check (bucket_id in ('products','site-assets'));

create policy "Authenticated delete product images" on storage.objects
for delete to authenticated using (bucket_id in ('products','site-assets'));
```

## 4. Publicar no Netlify
1. Envie a pasta do projeto para um repositório GitHub.
2. No Netlify, importe o repositório.
3. Não é necessário build command nem publish directory diferente da raiz.
4. Publique e teste as páginas `/` e `/admin.html`.
5. Configure domínio próprio, se houver.

## 5. Como administrar a loja
1. Acesse `seudominio.com.br/admin.html`.
2. Entre com o usuário criado no Supabase.
3. Em Produtos, cadastre nome, descrição, preço, categoria, tamanhos e fotos.
4. Marque destaque e disponibilidade.
5. Em Conteúdo do site, altere a história, foto da Carol, WhatsApp e link do grupo.

## 6. Como funciona o pedido
O carrinho monta o resumo e abre uma conversa no WhatsApp da loja. O site também tenta registrar o pedido no Supabase com status `pending_whatsapp`. Frete, disponibilidade e pagamento são confirmados pela loja na conversa.

## 7. Antes de entregar à Carol — checklist
- [ ] Receber e inserir fotos reais das camisetas.
- [ ] Confirmar número de WhatsApp e link do Club da Tshirteria.
- [ ] Inserir fotografia autorizada da Carol.
- [ ] Revisar descrições, preços, tamanhos e políticas de troca/entrega.
- [ ] Configurar Supabase e testar login/cadastro/edição/exclusão.
- [ ] Testar o carrinho e mensagem no WhatsApp em celular.
- [ ] Configurar domínio, canonical e imagem de compartilhamento.
- [ ] Criar política de privacidade e informações comerciais antes de divulgação pública.

## Observações importantes
- Os produtos que aparecem sem Supabase são **demonstrações visuais**, não produtos reais da MAR. Substitua-os antes de divulgar.
- O fluxo de pagamento online não está implementado nesta primeira versão, conforme combinado.
- O registro de pedido é uma primeira estrutura técnica. Para produção, recomenda-se evoluir para checkout com identificação do cliente, endereço, validação de estoque e proteção anti-spam.
