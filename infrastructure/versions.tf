terraform {
  required_version = ">= 1.5.0"

  required_providers {
    listmonk = {
      source  = "Muravlev/listmonk"
      version = "0.1.1"
    }
  }
}

provider "listmonk" {
  host     = var.listmonk_host
  username = var.listmonk_username
  password = var.listmonk_token
}
