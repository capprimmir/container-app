const sharp = require('sharp');
const chai = require("chai");
const http = require("chai-http");
const tools = require("../tools");

chai.use(http);

describe('Downloading image', () => {
  beforeEach((done) => {
    chai.request(tools.service)
      .delete('/uploads/test_image_download.jpg')
      .end(() => {
        chai.request(tools.service)
          .post('/uploads/test_image_download.jpg')
          .set('Content-Type', 'image/jpg')
          .send(tools.sample)
          .end((err, res) => {
            chai.expect(res).to.have.status(200);
            chai.expect(res.body).to.have.status('ok');
            return done();
          });
      });
  });

  it('should return original image size if not parameters given', (done) => {
    chai.request(tools.service)
      .get('/uploads/test_image_download.jpg')
      .end((err, res) => {
        chai.expect(res).to.have.status(200);
        chai.expect(res.body).to.have.length(tools.sample.length);
        return done();
      });
  });

  it('should be able to add image effects as requested', (done) => {
    chai.request(tools.service)
      .get('/uploads/test_image_download.jpg?flip=yes&flop=yes&blur=10&greyscale=yes&sharpen=yes')
      .end((err, res) => {
        chai.expect(res).to.have.status(200);
        return done();
      })
  })

  it('should resize the image width as requested', (done) => {
    chai.request(tools.service)
      .get('/uploads/test_image_download.jpg?width=200')
      .end((err, res) => {
        chai.expect(res).to.have.status(200);

        let image = sharp(res.body);
        image.metadata().then((metadata) => {
          chai.expect(metadata).to.have.property('width', 200);
          return done();
        });
      });
  });

  it('should resize the image height as requested', (done) => {
    chai.request(tools.service)
      .get('/uploads/test_image_download.jpg?height=200')
      .end((err, res) => {
        chai.expect(res).to.have.status(200);

        let image = sharp(res.body);
        image.metadata().then((metadata) => {
          chai.expect(metadata).to.have.property('height', 200);
          return done();
        });
      });
  });


  // it('should be able to resize the image when provide width and height', (done) => {
  //   chai.request(tools.service)
  //     .get('/uploads/test_image_download.jpg?width=200&height=100')
  //     .end((err, res) => {
  //       chai.expect(res).to.have.status(200);

  //       let image = sharp(res.body);
  //       image.metadata().then((metadata) => {
  //         chai.expect(metadata).to.have.property('width', 200);
  //         chai.expect(meatdata).to.have.property('height', 100);
  //         return done();
  //       });
  //     });
  // });
});