'use client'

import { createSignal } from 'solid-js'

const LoRaWANForm = () => {
  const [formData, setFormData] = createSignal({
    deviceEUI: '',
    applicationEUI: '',
    appKey: '',
    deviceAddress: '',
    networkSessionKey: '',
    appSessionKey: ''
  })

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    setFormData({
      ...formData(),
      [target.name]: target.value
    })
  }

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    console.log('Formular abgesendet:', formData())
    // Hier können Sie die Daten an Ihren Server senden oder weiter verarbeiten
  }

  return (
    <div class="w-full max-w-2xl mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 class="text-2xl font-bold mb-4">LoRaWAN Zugangsdaten</h2>
      <p class="mb-6 text-gray-600">Geben Sie hier Ihre LoRaWAN Zugangsdaten ein.</p>
      <form onSubmit={handleSubmit}>
        <div class="space-y-4">
          <div>
            <label for="deviceEUI" class="block text-gray-700 text-sm font-bold mb-2">
              Device EUI
            </label>
            <input
              id="deviceEUI"
              name="deviceEUI"
              value={formData().deviceEUI}
              onInput={handleChange}
              placeholder="z.B. 0011223344556677"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label for="applicationEUI" class="block text-gray-700 text-sm font-bold mb-2">
              Application EUI
            </label>
            <input
              id="applicationEUI"
              name="applicationEUI"
              value={formData().applicationEUI}
              onInput={handleChange}
              placeholder="z.B. 1122334455667788"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label for="appKey" class="block text-gray-700 text-sm font-bold mb-2">
              App Key
            </label>
            <input
              id="appKey"
              name="appKey"
              value={formData().appKey}
              onInput={handleChange}
              placeholder="z.B. 00112233445566778899AABBCCDDEEFF"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label for="deviceAddress" class="block text-gray-700 text-sm font-bold mb-2">
              Device Address
            </label>
            <input
              id="deviceAddress"
              name="deviceAddress"
              value={formData().deviceAddress}
              onInput={handleChange}
              placeholder="z.B. 11223344"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label for="networkSessionKey" class="block text-gray-700 text-sm font-bold mb-2">
              Network Session Key
            </label>
            <input
              id="networkSessionKey"
              name="networkSessionKey"
              value={formData().networkSessionKey}
              onInput={handleChange}
              placeholder="z.B. 00112233445566778899AABBCCDDEEFF"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label for="appSessionKey" class="block text-gray-700 text-sm font-bold mb-2">
              App Session Key
            </label>
            <input
              id="appSessionKey"
              name="appSessionKey"
              value={formData().appSessionKey}
              onInput={handleChange}
              placeholder="z.B. 00112233445566778899AABBCCDDEEFF"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
        <div class="flex items-center justify-between mt-6">
          <p class="text-sm text-gray-600">Alle Felder sind erforderlich</p>
          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Zugangsdaten speichern
          </button>
        </div>
      </form>
    </div>
  )
}

export default LoRaWANForm