import test from 'ava'
import { merge } from 'ramda'
import { assert } from '../../helpers/chai'
import { mock } from '../../helpers/boleto'
import request from '../../helpers/request'

test('POST /boletos', async (t) => {
  const { body, statusCode } = await request({
    route: '/boletos',
    method: 'POST',
    data: mock,
    headers: {
      'x-api-key': 'abc123',
    },
  })

  t.is(statusCode, 201)
  t.is(body.object, 'boleto')

  t.true(body.title_id != null)
  t.true(body.barcode != null)
  t.true(body.issuer_response_code != null)
  t.true(typeof body.title_id === 'number')
  t.true(typeof body.issuer_response_code === 'string')

  assert.containSubset(body, {
    status: 'registered',
    paid_amount: 0,
    amount: mock.amount,
    instructions: mock.instructions,
    issuer: mock.issuer,
    issuer_id: null,
    payer_name: mock.payer_name,
    payer_document_type: mock.payer_document_type,
    payer_document_number: mock.payer_document_number,
    company_name: mock.company_name,
    company_document_number: mock.company_document_number,
    queue_url: mock.queue_url,
  })
})

test('POST /boletos with invalid parameters', async (t) => {
  const wrongBoleto = merge(mock, {
    issuer: true,
    payer_name: 6000,
    a: 2,
    b: true,
    c: 'str',
  })

  const { body, statusCode } = await request({
    route: '/boletos',
    method: 'POST',
    data: wrongBoleto,
    headers: {
      'x-api-key': 'abc123',
    },
  })

  t.is(statusCode, 400)

  t.deepEqual(body, {
    errors: [
      {
        type: 'invalid_parameter',
        message: '"issuer" must be a string',
        field: 'issuer',
      },
      {
        type: 'invalid_parameter',
        message: '"payer_name" must be a string',
        field: 'payer_name',
      },
      {
        type: 'invalid_parameter',
        message: '"a" is not allowed',
        field: 'a',
      },
      {
        type: 'invalid_parameter',
        message: '"b" is not allowed',
        field: 'b',
      },
      {
        type: 'invalid_parameter',
        message: '"c" is not allowed',
        field: 'c',
      },
    ],
  })
})
