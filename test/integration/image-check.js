const chai = require("chai");
const http = require("chai-http");
const tools = require("../tools");

chai.use(http);

describe('Checking if image exists', () => {
  beforeEach((done) => {
    chai.request(tools.service)
      .delete('/uploads/test_image_check.jpg')
      .end(done);
  });

  it('should return 404 if image does not exists ', (done) => {
    chai.request(tools.service)
      .head('/uploads/test_image_check.jpg')
      .end((err, res) => {
        chai.expect(res).to.have.status(404);
        return done();
      });
  });

  it('should return 200 if images exists', (done) => {
    chai.request(tools.service)
      .post('/uploads/test_image_check.jpg')
      .set('Content-Type', 'image/jpg')
      .send(tools.sample)
      .end((err, res) => {
        chai.expect(res).to.have.status(200);
        chai.expect(res.body).to.have.status("ok");

        chai.request(tools.service)
          .head('/uploads/test_image_check.jpg')
          .end((err, res) => {
            chai.expect(res).to.have.status(200);
            return done();
          })
      })
  })
})