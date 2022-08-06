const path = require('path');
const jwt = require('jsonwebtoken');
const { expect } = require('chai');
const sinon = require('sinon');
const config = require(path.join(__dirname, '..', 'config'));
const authMiddleware = require(path.join(__dirname, '..', 'src', 'middleware', 'auth'));

describe('auth middleware', () => {
    it('handle function should append auth data when no header present and handled', () => {
        const req = {
            get: key => undefined,
        };

        authMiddleware.handle(req, {}, () => {});

        expect(req.auth).to.be.an('object');
        expect(req.auth.data).to.be.a('null');
    });

    it('should append auth data when header is present with invalid token and handled', () => {
        const req = {
            get: key => key.toLowerCase() === 'authorization' ? 'bearer INVALIDTESTOKEN' : undefined,
        };

        authMiddleware.handle(req, {}, () => {});

        expect(req.auth).to.be.an('object');
        expect(req.auth.data).to.be.a('null');
    });

    it('should append auth data and user data when header is present with valid token and handled', () => {
        const req = {
            get: key => key.toLowerCase() === 'authorization' ? `bearer validtest` : undefined,
        };

        sinon.stub(jwt, 'verify')

        jwt.verify.returns({
            userId: 'abc789',
            email: 'testemail@example.com',
        });

        authMiddleware.handle(req, {}, () => {});

        expect(req.auth).to.be.an('object');
        expect(req.auth.data).to.be.an('object');
        expect(req.auth.data.userId).to.equal('abc789');
        expect(req.auth.data.email).to.equal('testemail@example.com');

        jwt.verify.restore();
    });

    it('should throw if no header is present and handled & required', () => {
        const req = {
            get: key => undefined,
        };

        authMiddleware.handle(req, {}, () => {});

        expect(authMiddleware.required.bind(this, req, {}, () => {})).to.throw();
    });

    it('should not throw when header is present with valid token and handled & required', () => {
        const req = {
            get: key => key.toLowerCase() === 'authorization' ? `bearer validtest` : undefined,
        };

        sinon.stub(jwt, 'verify')

        jwt.verify.returns({
            userId: 'abc789',
            email: 'testemail@example.com',
        });

        authMiddleware.handle(req, {}, () => {});

        expect(authMiddleware.required.bind(this, req, {}, () => {})).to.not.throw();

        jwt.verify.restore();
    });
});