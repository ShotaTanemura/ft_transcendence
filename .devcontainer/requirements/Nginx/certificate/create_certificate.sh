
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -aes-256-cbc -out privkey.pem
openssl req -new -key privkey.pem -out csr.pem
openssl x509 -req -in csr.pem -signkey privkey.pem -days 90 -out crt.pem
echo -n "enter privkey password: "
read -s password
echo $password > passwd

