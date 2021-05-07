import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { request } from "graphql-request";
// eslint-disable-next-line import/no-unresolved
import { lists } from ".keystone/api";
import useSWR from "swr";
import { useRouter } from "next/router";

import { getCurrentUser } from "../requestAuth";

const fetcher = (query) => request("/api/graphql", query);

export default function HomePage({ authedUser }) {
  const router = useRouter();

  useEffect(async () => {
    if (!authedUser) {
      await router.push("/signin");
    }
  });
  
  const { data, error } = useSWR(
    `query {
      allPosts {
        title
        slug
        content
        user{
          name
        }
      }
    }
    `,
    fetcher
  );

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;

  return (
    <div>
      <Image src="/logo.svg" width="38" height="38" alt="Keystone" />
      <h1
        style={{ display: "inline", marginLeft: "10px", verticalAlign: "top" }}
      >
        Welcome to my blog{authedUser && `, ${authedUser.name}`}
      </h1>
      <ul>
        {data.allPosts.map((post, i) => (
          <li key={i}>
            <Link href={`/post/${post.slug}`}>
              <a>{post.title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function getServerSideProps({ req }) {
  const authedUser = await getCurrentUser(req);
  const posts = await lists.Post.findMany({ query: "slug title" });
  return { props: { posts, authedUser } };
}
