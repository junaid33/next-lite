import React, { useEffect, useState } from "react";
import { Box, Text, Input, Button, Heading, Link } from "@chakra-ui/react";
import { Logo } from "@icons";
import NextLink from "next/link";
import { useRouter } from "next/router";
import useForm from "@lib/useForm";

import { request } from "graphql-request";
import { getCurrentUser } from "../requestAuth";

const SIGNIN_MUTATION = /* GraphQL */ `
  mutation SIGNIN_MUTATION($email: String!, $password: String!) {
    authenticateUserWithPassword(email: $email, password: $password) {
      ... on UserAuthenticationWithPasswordSuccess {
        item {
          id
          email
          name
        }
      }
      ... on UserAuthenticationWithPasswordFailure {
        code
        message
      }
    }
  }
`;

export default function SignIn({ authedUser }) {
  const router = useRouter();

  useEffect(async () => {
    if (authedUser) {
      await router.push("/");
    }
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);

  const { inputs, handleChange, resetForm } = useForm({
    email: "",
    password: "",
  });
  // const [signin, { data, loading }] = useMutation(SIGNIN_MUTATION, {
  //   variables: inputs,
  //   // refetch the currently logged in user
  //   refetchQueries: [{ query: CURRENT_USER_QUERY }],
  // });
  async function handleSubmit(e) {
    e.preventDefault(); // stop the form from submitting
    setError(null);
    setLoading(true)
    console.log(inputs);
    const res = await request("/api/graphql", SIGNIN_MUTATION, inputs);
    setLoading(false)

    if (res.authenticateUserWithPassword.code === "FAILURE") {
      setError(res.authenticateUserWithPassword.message);
    } else {
      resetForm();
      router.push("/");
    }
    // Send the email and password to the graphqlAPI
  }
  //  error =
  //   data?.authenticateUserWithPassword.__typename ===
  //   'UserAuthenticationWithPasswordFailure'
  //     ? data?.authenticateUserWithPassword
  //     : undefined;

  return (
    <Box
      // background="linear-gradient(87deg,#172b4d 25%,#1a174d 100%)"
      {...{
        backgroundColor: "#ffffff",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='12' viewBox='0 0 20 12'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='charlie-brown' fill='%23f0f0f0' fill-opacity='0.4'%3E%3Cpath d='M9.8 12L0 2.2V.8l10 10 10-10v1.4L10.2 12h-.4zm-4 0L0 6.2V4.8L7.2 12H5.8zm8.4 0L20 6.2V4.8L12.8 12h1.4zM9.8 0l.2.2.2-.2h-.4zm-4 0L10 4.2 14.2 0h-1.4L10 2.8 7.2 0H5.8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      }}
      minH="100vh"
    >
      <Box display="flex" alignItems="center" height="100%" mt="10%">
        <Box
          mx="auto"
          bg="blueGray.50"
          boxShadow="mg"
          borderRadius="10px"
          p={8}
          width="350px"
          borderWidth="1px"
        >
          <Box width="12rem" mb={8}>
            <Logo width="100%" height="100%" />
          </Box>
          <Heading fontSize="3xl" mb={4}>
            Sign-in
          </Heading>
          <form method="POST" onSubmit={handleSubmit}>
            {/* <Error error={error} /> */}
            <fieldset>
              <Box mb={2}>
                <Text
                  color="gray.700"
                  fontWeight={500}
                  as="label"
                  htmlFor="email"
                >
                  Email
                </Text>
                <Input
                  autoComplete="email"
                  autoFocus
                  placeholder="you@awesome.com"
                  type="email"
                  name="email"
                  bg="white"
                  mt={1}
                  value={inputs.email}
                  onChange={handleChange}
                />
              </Box>
              <Box mb={4}>
                <Text
                  color="gray.700"
                  fontWeight={500}
                  as="label"
                  htmlFor="email"
                >
                  Password
                </Text>
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  autoComplete="password"
                  value={inputs.password}
                  onChange={handleChange}
                  bg="white"
                  mt={1}
                />
              </Box>

              <Button
                width="100%"
                // variant="invert"
                colorScheme="blue"
                // bg="blue.700"
                // color="white"
                // _hover={{ bg: 'blue.800' }}
                type="submit"
                // borderWidth="1px"
                textTransform="uppercase"
                letterSpacing="wider"
                fontWeight={700}
                boxShadow="sm"
                borderRadius={2}
                isLoading={loading}
              >
                Sign in
              </Button>
            </fieldset>
            {error && <Box
              bg="rose.50"
              borderRadius="5px"
              p={2}
              mt={3}
              color="rose.600"
              textAlign="center"
              boxShadow="clean"
              fontWeight={500}
            >
              {error}
            </Box>}
          </form>

          <Box mt={6}>
            <Text color="gray.600" my={1}>
              Don't have an account yet?
            </Text>
            <NextLink href="/auth/signup" passHref>
              <Link
                float="left"
                color="green.700"
                borderBottom="2px solid green.700"
                cursor="pointer"
                my={0}
              >
                Sign up for free
              </Link>
            </NextLink>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export async function getServerSideProps({ req }) {
  const authedUser = await getCurrentUser(req);
  return { props: { authedUser } };
}
