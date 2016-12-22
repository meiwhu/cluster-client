'use strict';

const assert = require('power-assert');
const mock = require('egg-mock');
const request = require('supertest');

describe('test/egg.test.js', () => {
  let app;
  before(function* () {
    app = mock.cluster({
      baseDir: 'apps/demo',
    });
    yield app.ready();
  });

  it('should publish & subscribe ok', done => {
    request(app.callback())
      .post('/publish')
      .send({ value: '30.20.78.299' })
      .expect(200, 'ok', () => {
        setTimeout(() => {
          request(app.callback())
            .get('/get')
            .expect(200, '30.20.78.299:20880', done);
        }, 500);
      });
  });

  it('should handle client down', done => {
    request(app.callback())
      .get('/kill_agent')
      .expect(200, 'ok', err => {
        assert.ifError(err);

        setTimeout(() => {
          request(app.callback())
            .post('/publish')
            .send({ value: '30.20.78.300' })
            .expect(200, 'ok', err => {
              assert.ifError(err);
              setTimeout(() => {
                request(app.callback())
                  .get('/get')
                  .expect(200, '30.20.78.299:20880,30.20.78.300:20880', done);
              }, 500);
            });
        }, 2000);
      });
  });

  after(() => {
    app.close();
  });
});