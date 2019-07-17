const chai = require('chai');
const http = require('chai-http');
const tools = require('../tools');

chai.use(http);

describe('Uploading image', () => {
  beforeEach((done) => {
    chai.request(tools.service)
      .delete('/uploads/test_image_upload.jpg')
      .end(() => {
        return done();
      });
  });

  it('should accept a JPG image', (done) => {
    chai.request(tools.service)
      .post('/uploads/test_image_upload.jpg')
      .set('Content-Type', 'image/jpg')
      .send(tools.sample)
      .end((err, res) => {
        chai.expect(res).to.have.status(200);
        chai.expect(res.body).to.have.status('ok');
        return done();
      });
  });

  it('should deny duplicated images', (done) => {
    chai.request(tools.service)
      .post('/uploads/test_image_upload.jpg')
      .set('Content-Type', 'image/jpg')
      .send(tools.sample)
      .end((err, res) => {
        chai.expect(res).to.have.status(200);
        chai.expect(res.body).to.have.status('ok');

        chai.request(tools.service)
          .post('/uploads/test_image_upload.jpg')
          .set('Content-Type', 'image/jpg')
          .send(tools.sample)
          .end((err, res) => {
            chai.expect(res).to.have.status(200);
            chai.expect(res.body).to.have.property('code', 'ER_DUP_ENTRY');
            return done();
          })
      });
  });
});