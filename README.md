# Diploma Zinciri
## Ethereum smart contract ile Diploma sahteciğini önlemek

[![N|Solid](https://res.cloudinary.com/practicaldev/image/fetch/s--uJjgTz8I--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/8k73hi03ck8mnm830xpu.png)](https://res.cloudinary.com/practicaldev/image/fetch/s--uJjgTz8I--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/8k73hi03ck8mnm830xpu.png)

50. Liseler Arası TÜBİTAK Projesi kapsamında hazırlamış olduğum akıllı kontrat (smart contract) temelli diploma alma - verme sistemidir.

- Merkeziyetsiz.
- Değiştirilemez.


## Özellikler

- Sanal bir ethereum ağında çalışır.
- Web arayüzü sayesinde, kurum, üniversite, öğrenci hesabı oluşturabilir ve zincire ekleyebilirsiniz.
- Transection işlemleri sırasında Metamask cüzdan kullanılır.

## Tech

Kullanılan yazılımlar:

- [Ganache] - Yerel bir ethereum ağı oluşturur.
- [Metamask] - Transection işlemleri için cüzdan
- [Solidty] - Akıllı kontratları yazdığımız yazılım dili
- [node.js] - Web arayüzü ve backend için kullandığımız yazılım dili
- [HTML] - Tasarım

## Kurulum

[Node.js](https://nodejs.org/) buradan inidirin.
[Ganache](https://archive.trufflesuite.com/ganache/) buradan indirin.
[Metamask](https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn) buradan indirin.

build klasörünü silin.

```sh
npm install
npm install -g truffle
truffle compile
truffle migrate
npm run start
```
NOT: hata verirse: npm i true-case-path KOMUTUNU ÇALIŞTIRIN.
