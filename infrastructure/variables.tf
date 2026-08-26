variable "listmonk_host" {
  description = "Base URL of the Listmonk instance."
  type        = string
  default     = "https://news.regenfass.eu"
}

variable "listmonk_username" {
  description = "Listmonk API username."
  type        = string
  sensitive   = true
}

variable "listmonk_token" {
  description = "Listmonk API token used as the provider password."
  type        = string
  sensitive   = true
}
