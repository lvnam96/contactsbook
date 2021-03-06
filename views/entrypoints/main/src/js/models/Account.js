import Factory from './Factory';
// import _ from 'lodash';

// IN: obj
// FROM: json obj from server, old inst, example empty obj
// obj = {
//     id: string.isRequired,
//     uname: string.isRequired,
//     passwd: string.isRequired,
//     fbId: string.default(null),
//     email: string.default(null),
//     createdOn: date.isRequired,
// }

// OUT: obj
// HOW: new Contact() | Contact.fromJSON() | Contact.fromScratch()
// obj = {
//     id: string.jsonizable,
//     uname: string.jsonizable,
//     passwd: string.jsonizable,
//     fbId: string.jsonizable,
//     email: string.jsonizable,
//     createdOn: date.jsonizable,
// }

class Account extends Factory {
  constructor (data) {
    super(data);
    if (!data.id || !data.uname || !data.createdOn) {
      throw new Error("Account's instance requires props: id, uname, createdOn");
    }
    this._id = data.id;
    this._uname = data.uname;
    this._passwd = undefined; // data.passwd; // always undefined
    this.fbId = data.fbId || null;
    this.email = data.email || null;
    this.createdOn = new Date(data.createdOn);
    this._salt = data.salt || null; // always be null because we will never pass salt to client
    this._isSerializable = this._isSerializable || new Set();
    for (const keyname of ['id', 'uname', 'passwd', 'fbId', 'email', 'createdOn']) {
      this._isSerializable = this._isSerializable.add(keyname);
    }
  }

  static fromJSON (data) {
    return super.fromJSON(data);
  }

  get id () {
    return this._id;
  }

  set id (x) {}

  get uname () {
    return this._uname;
  }

  set uname (x) {}

  get username () {
    return this._uname;
  }

  get passwd () {
    return this._passwd;
  }

  set passwd (x) {}

  get salt () {
    return this._salt;
  }

  set salt (x) {}
}

export default Account;
