import { config } from "@keystone-next/keystone/schema";
import {
  statelessSessions,
  withItemData,
} from "@keystone-next/keystone/session";
import { createAuth } from "@keystone-next/auth";
import { lists } from "./schema";
import "dotenv/config";

/**
 * TODO: Implement validateItem. Would be invoked by the getItem() method in
 * packages-next/auth/src/getExtendGraphQLSchema.ts
 */

const sessionSecret = process.env.SESSION_SECRET;
const sessionMaxAge = 60 * 60 * 24 * 30; // 30 days

// createAuth configures signin functionality based on the config below. Note this only implements
// authentication, i.e signing in as an item using identity and secret fields in a list. Session
// management and access control are controlled independently in the main keystone config.
const { withAuth } = createAuth({
  // This is the list that contains items people can sign in as
  listKey: "User",
  // The identity field is typically a username or email address
  identityField: "email",
  // The secret field must be a password type field
  secretField: "password",
  /* TODO -- review this later, it's not implemented yet and not fully designed (e.g error cases)
  // This ensures than an item is actually able to sign in
  validateItem: ({ item }) => item.isEnabled,
  */
  // initFirstItem turns on the "First User" experience, which prompts you to create a new user
  // when there are no items in the list yet
  initFirstItem: {
    // These fields are collected in the "Create First User" form
    fields: ["name", "email", "password"],
    // This is additional data that will be set when creating the first item
    itemData: {
      // We need to specify that isAdmin is true for the first item, so the user can access the
      // Admin UI (see isAccessAllowed in the admin config below)
      isAdmin: true,
      // Only enabled users can sign in, so we need to set this as well
      // TODO: Come back to this when we review how to restrict signin to valid users
      // isEnabled: true,
    },
  },
  /* TODO -- complete the UI for these features and enable them
  passwordResetLink: {
    sendToken(args) {
      console.log(`Password reset info:`, args);
    },
  },
  magicAuthLink: {
    sendToken(args) {
      console.log(`Magic auth info:`, args);
    },
  },
  */
});

// withAuth applies the signin functionality to the keystone config
export default withAuth(
  config({
    db: { provider: "postgresql", url: process.env.DATABASE_URL },
    lists,
    ui: {
      isAccessAllowed: ({ session }) => !!session,
      publicPages: ["/welcome"],
      getAdditionalFiles: [
        async (config) => [
          {
            mode: "write",
            outputPath: "pages/welcome.js",
            src: `
            import React from 'react';
            import Image from 'next/image';
            import Link from 'next/link';
            import { getCurrentUser } from '../requestAuth';
            // eslint-disable-next-line import/no-unresolved
            import { lists } from '.keystone/api';
            
            export default function HomePage({ posts, authedUser }) {
              return (
                <div>
                  <Image src="/logo.svg" width="38" height="38" alt="Keystone" />
                  <h1 style={{ display: 'inline', marginLeft: '10px', verticalAlign: 'top' }}>
                    Welcome to my blog
                  </h1>
                  <ul>
                    {posts.map((post, i) => (
                      <li key={i}>
                        
                          <a>{post.title}</a>
                        
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            
            export async function getServerSideProps({ req }) {
              const authedUser = await getCurrentUser(req);
              const posts = await lists.Post.findMany({ query: 'slug title' });
              return { props: { posts, authedUser } };
            }`,
          },
        ],
      ],
    },
    session: withItemData(
      // Stateless sessions will store the listKey and itemId of the signed-in user in a cookie
      statelessSessions({
        // The maxAge option controls how long session cookies are valid for before they expire
        maxAge: sessionMaxAge,
        // The session secret is used to encrypt cookie data (should be an environment variable)
        secret: sessionSecret,
      }),
      // withItemData will fetch these fields for signed-in User items to populate session.data
      { User: "id name email isAdmin" }
    ),
    experimental: {
      enableNextJsGraphqlApiEndpoint: true,
      generateNextGraphqlAPI: true,
      generateNodeAPI: true,
    },
  })
);
