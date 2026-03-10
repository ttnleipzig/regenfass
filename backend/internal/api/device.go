package api

import (
	"github.com/gofiber/fiber/v3"
)

// HTTPError represents an HTTP error response
type HTTPError struct {
	Code    int    `json:"code" example:"400"`
	Message string `json:"message" example:"error message"`
}

// DeviceInfoResponse represents device information response
type DeviceInfoResponse struct {
	Token          string `json:"token" example:"dev_token_123"`
	ReadWriteToken string `json:"read_write_token" example:"rw_token_123"`
	ReadOnlyToken  string `json:"read_only_token" example:"ro_token_123"`
	DeviceEUI      string `json:"device_eui" example:"AABBCCDDEEFF0011"`
}

// GetDeviceByToken godoc
//
//	@Summary		Get device information by token
//	@Description	Retrieve device details using either read-write or read-only token
//	@Tags			devices
//	@Accept			json
//	@Produce		json
//	@Param			deviceToken	path		string			true	"Device token (read-write or read-only)"
//	@Success		200			{object}	DeviceInfoResponse
//	@Failure		400			{object}	HTTPError	"Invalid token"
//	@Failure		404			{object}	HTTPError	"Device not found"
//	@Failure		500			{object}	HTTPError	"Internal server error"
//	@Router			/device/{deviceToken} [get]
func (a *API) handleDeviceInfoByToken(c fiber.Ctx) error {
	return nil
}
