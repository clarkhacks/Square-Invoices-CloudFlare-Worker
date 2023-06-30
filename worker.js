addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const locationID = 'YOUR LOCATION ID'
  const url = new URL(request.url)
  const customerIDs = url.searchParams.get('id')
  const returnHTML = url.searchParams.get('html')

  if (!customerIDs) {
    return new Response('Missing customer IDs', { status: 400 })
  }

  const customerIDsArray = customerIDs.split(',')

  const results = {}

  const headers = {
    'Square-Version': '2023-06-08',
    'Authorization': `Bearer ${APIKEY}`,
    'Content-Type': 'application/json'
  }

  const fetchPromises = customerIDsArray.map(async customerID => {
    const body = JSON.stringify({
      "query": {
        "filter": {
          "location_ids": [
            locationID
          ],
          "customer_ids": [
            customerID
          ]
        },
        "sort": {
          "order": "DESC",
          "field": "INVOICE_SORT_DATE"
        }
      },
      "limit": 20,
      "cursor": "0"
    })

    try {
      const response = await fetch('https://connect.squareup.com/v2/invoices/search', {
        method: 'POST',
        headers,
        body
      })

      if (!response.ok) {
        throw new Error(`Square API request failed for customer ID ${customerID}. Status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.invoices) {
        throw new Error(`Invoices not found for customer ID ${customerID}`)
      }

      const invoices = data.invoices.map(invoice => ({
        id: invoice.id,
        order_id: invoice.order_id,
        primary_recipient: invoice.primary_recipient,
        invoice_number: invoice.invoice_number,
        status: invoice.status,
        created_at: invoice.created_at,
        total_completed_amount_money: invoice.payment_requests[0].total_completed_amount_money,
        payment_url: `https://squareup.com/pay-invoice/${invoice.id}`,
        amount: invoice.payment_requests[0].computed_amount_money,
        due: invoice.payment_requests[0].due_date
      }))

      if (returnHTML === 'true') {
        const html = generateHTML(invoices) // Generate HTML using the provided template and invoice data
        results[customerID] = html
      } else {
        results[customerID] = invoices
      }
    } catch (error) {
      console.error(error)
      throw new Error(`Square API request failed for customer ID ${customerID}. Error: ${error.message}`)
    }
  })

  await Promise.all(fetchPromises)

  // return new Response(JSON.stringify(results), {
  //   headers: { 'Content-Type': 'application/json' }
  // })
  // if html return html if not return json. 
  if (returnHTML === 'true') {
    return new Response(results[customerIDsArray[0]], {
      headers: { 'Content-Type': 'text/html' }
    })
  }
  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  })
}

function generateHTML(invoices) {
  // You can modify this function to generate HTML using the provided template and invoice data
  // Here's a simple example:
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoices</title>
    <style>/* ! tailwindcss v3.3.2 | MIT License | https://tailwindcss.com */*,::after,::before{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}::after,::before{--tw-content:''}html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]{display:none}*, ::before, ::after{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgb(59 130 246 / 0.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }::-webkit-backdrop{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgb(59 130 246 / 0.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }::backdrop{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgb(59 130 246 / 0.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }.col-span-5{grid-column:span 5 / span 5}.col-start-4{grid-column-start:4}.m-4{margin:1rem}.ml-4{margin-left:1rem}.flex{display:flex}.grid{display:grid}.h-fit{height:-moz-fit-content;height:fit-content}.h-screen{height:100vh}.w-fit{width:-moz-fit-content;width:fit-content}.grid-cols-6{grid-template-columns:repeat(6, minmax(0, 1fr))}.flex-col{flex-direction:column}.items-center{align-items:center}.justify-center{justify-content:center}.gap-4{gap:1rem}.gap-y-2{row-gap:0.5rem}.rounded-lg{border-radius:0.5rem}.rounded-xl{border-radius:0.75rem}.rounded-br-xl{border-bottom-right-radius:0.75rem}.rounded-tl-lg{border-top-left-radius:0.5rem}.border-2{border-width:2px}.border-b-4{border-bottom-width:4px}.border-gray-200{--tw-border-opacity:1;border-color:rgb(229 231 235 / var(--tw-border-opacity))}.bg-green-500{--tw-bg-opacity:1;background-color:rgb(34 197 94 / var(--tw-bg-opacity))}.bg-red-500{--tw-bg-opacity:1;background-color:rgb(239 68 68 / var(--tw-bg-opacity))}.bg-sky-100{--tw-bg-opacity:1;background-color:rgb(224 242 254 / var(--tw-bg-opacity))}.bg-sky-500{--tw-bg-opacity:1;background-color:rgb(14 165 233 / var(--tw-bg-opacity))}.bg-white{--tw-bg-opacity:1;background-color:rgb(255 255 255 / var(--tw-bg-opacity))}.p-5{padding:1.25rem}.px-3{padding-left:0.75rem;padding-right:0.75rem}.px-4{padding-left:1rem;padding-right:1rem}.py-1{padding-top:0.25rem;padding-bottom:0.25rem}.text-sm{font-size:0.875rem;line-height:1.25rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-xs{font-size:0.75rem;line-height:1rem}.font-bold{font-weight:700}.text-gray-400{--tw-text-opacity:1;color:rgb(156 163 175 / var(--tw-text-opacity))}.text-sky-500{--tw-text-opacity:1;color:rgb(14 165 233 / var(--tw-text-opacity))}.text-white{--tw-text-opacity:1;color:rgb(255 255 255 / var(--tw-text-opacity))}.hover\:bg-gray-50:hover{--tw-bg-opacity:1;background-color:rgb(249 250 251 / var(--tw-bg-opacity))}@media (min-width: 768px){.md\:col-span-4{grid-column:span 4 / span 4}.md\:col-start-auto{grid-column-start:auto}.md\:ml-0{margin-left:0px}.md\:justify-end{justify-content:flex-end}}</style>
    </head>
    <body>
    <div class="">
        ${invoices.map(invoice => `
            <div class="bg-white w-max-lg border-2 border-b-4 border-gray-200 rounded-xl hover:bg-gray-50 m-4">
              <p class="bg-${invoice.status == 'UNPAID' ? 'red' : invoice.status == 'PAID' ? 'green' : 'sky'}-500 w-fit px-4 py-1 text-sm font-bold text-white rounded-tl-lg rounded-br-xl">${invoice.status == 'SCHEDULED' ? invoice.status + ' ('+ invoice.due + ')' : invoice.status}</p>
              <div class="grid grid-cols-6 p-5 gap-y-2">
                <div class="col-span-5 md:col-span-4 ml-4">
                  <p class="text-sky-500 font-bold text-xl">${invoice.primary_recipient.given_name + ' ' + invoice.primary_recipient.family_name }</p>
                  <a class="text-gray-400" href="${invoice.payment_url}" style="text-decoration: underline;">View Invoice</a>
                </div>
                <div class="flex col-start-4 ml-4 md:col-start-auto md:ml-0 md:justify-end">
                  <p class="rounded-lg text-sky-500 font-bold bg-sky-100 py-1 px-3 text-sm w-fit h-fit">$${invoice.amount.amount / 100}</p>
                </div>
              </div>
            </div>
        `).join('')}
        </div>
    </body>
    </html>
  `;

  return htmlTemplate;
}
