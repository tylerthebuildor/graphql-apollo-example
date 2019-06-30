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
      signup(_, { organization, id, name }) {
        const user = { organization, id, name };
        const match = db.users.find(user => user.name === name);
        if (match) throw Error('This username already exists');
        db.users.push(user);
        return user;
      },
    },
    Query: {
      login(_, { username }) {
        const user = db.users.find(user => user.name === username);
        if (!user) {
          throw Error('username was incorrect');
        }
        const token = jwt.sign({ id: user.id }, JWT_SECRET);
        return token;
      },
      tellMeADadJoke(_, data, { user }) {
        if (!user) throw Error('not authorized');
        return 'If you see a robbery at an Apple Store does that make you an iWitness?';
      },
      users: () => db.users,
      user: (_, { id }) => db.users.find(user => user.id === id),
      organizations: () => db.organizations,
      organization: (_, { id }) =>
        db.organizations.find(organization => organization.id === id),
    },
    User: {
      organization: parent =>
        db.organizations.find(({ id }) => parent.organizationId === id),
    },
    Organization: {
      async users(parent) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const organization = db.users.filter(({ id }) =>
          parent.userIds.includes(id)
        );
        return organization;
      },
    },
  },
});

server.listen().then(({ url }) => console.log(`Server ready at ${url}`));
