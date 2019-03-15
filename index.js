const { ApolloServer, gql } = require('apollo-server');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'makethislongandrandom';

// This could also be MongoDB, PostgreSQL, etc
const db = {
  users: [
    {
      organization: '123', // this is a relation by id
      id: 'abc',
      name: 'Elon Musk',
    },
  ],
  organizations: [
    {
      users: ['abc'], // this is a relation by ids
      id: '123',
      name: 'Space X',
    },
  ],
};

class User {
  constructor({ organization, id, name }) {
    this.organizationId = organization;
    this.id = id;
    this.name = name;
  }

  organization() {
    const organization = db.organizations.find(
      ({ id }) => id === this.organizationId
    );
    return new Organization(organization);
  }
}

class Organization {
  constructor({ users, id, name }) {
    this.userIds = users;
    this.id = id;
    this.name = name;
  }

  // async method
  async users() {
    await new Promise(resolve => setTimeout(resolve, 5000));
    return db.users
      .filter(({ id }) => this.userIds.includes(id))
      .map(user => new User(user));
  }
}

const server = new ApolloServer({
  context: ({ req }) => {
    let user = null;
    try {
      const token = req.headers.authorization.replace('Bearer ', '');
      user = jwt.verify(token, JWT_SECRET);
    } catch (error) {}
    return { user };
  },
  typeDefs: gql`
    type Mutation {
      signup(organization: String, id: String, name: String): User
    }
    type Query {
      login(username: String): String
      tellMeADadJoke: String
      users: [User]
      user(id: ID!): User
      organizations: [Organization]
      organization(id: ID!): Organization
    }
    type User {
      organization: Organization
      id: ID
      name: String
    }
    type Organization {
      users: [User]
      id: ID
      name: String
    }
  `,
  resolvers: {
    Mutation: {
      signup(parent, { organization, id, name }) {
        const user = { organization, id, name };
        const match = db.users.find(user => user.name === name);
        if (match) throw Error('This username already exists');
        db.users.push(user);
        return new User(user);
      },
    },
    Query: {
      login(parent, { username }) {
        const user = db.users.find(user => user.name === username);
        if (!user) {
          throw Error('username was incorrect');
        }
        const token = jwt.sign({ id: user.id }, JWT_SECRET);
        return token;
      },
      tellMeADadJoke(parent, data, { user }) {
        if (!user) throw Error('not authorized');
        return 'If you see a robbery at an Apple Store does that make you an iWitness?';
      },
      users() {
        return db.users.map(user => new User(user));
      },
      user(parent, { id }) {
        return new User(db.users.find(user => user.id === id));
      },
      organizations() {
        return db.organizations.map(
          organization => new Organization(organization)
        );
      },
      organization(parent, { id }) {
        const organization = db.organizations.find(
          organization => organization.id === id
        );

        return new Organization(organization);
      },
    },
  },
});

server.listen().then(({ url }) => console.log(`Server ready at ${url}`));
