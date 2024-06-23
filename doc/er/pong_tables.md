# Tables

```mermaid
erDiagram

users ||--|| ft_api_tokens : token

users {
    string uuid PK
    string name
    string email
    string password
}

ft_api_tokens {
    string uuid FK
    string token
    string salt
}
```
