import {
  Alert,
  AlertDescription,
  AlertTitle,
  FormControl,
  GridItem,
  ListItem,
  Select,
  SimpleGrid,
  Stack,
  UnorderedList,
} from "@chakra-ui/react"
import { useWeb3React } from "@web3-react/core"
import Button from "components/common/Button"
import Card from "components/common/Card"
import CardMotionWrapper from "components/common/CardMotionWrapper"
import FormErrorMessage from "components/common/FormErrorMessage"
import Layout from "components/common/Layout"
import Section from "components/common/Section"
import DynamicDevTool from "components/create-guild/DynamicDevTool"
import useCreate from "components/create-guild/hooks/useCreate"
import useServerData from "components/create-guild/PickRolePlatform/components/Discord/hooks/useServerData"
import DCServerCard from "components/guard/setup/DCServerCard"
import PickMode from "components/guard/setup/PickMode"
import { Web3Connection } from "components/_app/Web3ConnectionManager"
import { AnimatePresence, AnimateSharedLayout } from "framer-motion"
import { useRouter } from "next/router"
import { useContext, useEffect, useMemo, useState } from "react"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import useSWR from "swr"

const Page = (): JSX.Element => {
  const router = useRouter()
  const { account } = useWeb3React()
  const { openWalletSelectorModal } = useContext(Web3Connection)

  const defaultValues = {
    imageUrl: "/guildLogos/0.svg",
    platform: "DISCORD",
    isGuarded: true,
    DISCORD: {
      platformId: undefined,
    },
    channelId: undefined,
    grantAccessToExistingUsers: "false",
    requirements: [
      {
        type: "FREE",
      },
    ],
  }

  // TODO: form type
  const methods = useForm<any>({
    mode: "all",
    defaultValues,
  })

  const { data: servers } = useSWR("usersServers", null, {
    revalidateOnMount: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  })

  useEffect(() => {
    if (router.isReady && !Array.isArray(servers)) {
      router.push("/guard")
    }
  }, [servers, router])

  const selectedServer = useWatch({
    control: methods.control,
    name: "DISCORD.platformId",
  })

  const filteredServers = useMemo(
    () =>
      selectedServer
        ? servers.filter((server) => server.value == selectedServer)
        : servers ?? [],
    [selectedServer, servers]
  )

  const {
    data: { channels },
  } = useServerData(selectedServer, {
    refreshInterval: 0,
  })

  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (selectedServer)
      setTimeout(() => {
        setShowForm(true)
      }, 300)
    else setShowForm(false)
  }, [selectedServer])

  useEffect(() => {
    if (!selectedServer) methods.setValue("name", "")
    methods.setValue(
      "name",
      servers?.find((server) => server.value == selectedServer)?.label
    )
  }, [selectedServer])

  const resetForm = () => {
    methods.reset(defaultValues)
    methods.setValue("DISCORD.platformId", null)
  }

  const { onSubmit, isLoading, response, isSigning } = useCreate()

  const loadingText = (): string => {
    if (isSigning) return "Check your wallet"
    return "Saving data"
  }

  return (
    <Layout title={selectedServer ? "Set up Guild Guard" : "Select a server"}>
      <FormProvider {...methods}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 5, md: 6 }}>
          <AnimateSharedLayout>
            <AnimatePresence>
              {filteredServers.map((serverData) => (
                <CardMotionWrapper key={serverData.value}>
                  <GridItem>
                    <DCServerCard
                      serverData={serverData}
                      onSelect={
                        selectedServer
                          ? undefined
                          : (newServerId) =>
                              methods.setValue("DISCORD.platformId", newServerId)
                      }
                      onCancel={() => resetForm()}
                    />
                  </GridItem>
                </CardMotionWrapper>
              ))}

              {showForm && (
                <GridItem colSpan={2}>
                  <CardMotionWrapper>
                    <Card px={{ base: 5, sm: 6 }} py={7}>
                      <Stack spacing={8}>
                        <Section title="Entry channel">
                          <FormControl
                            isInvalid={!!methods?.formState?.errors?.channelId}
                            isDisabled={!channels?.length}
                            defaultValue={channels?.[0]?.id}
                          >
                            <Select
                              maxW="50%"
                              size={"lg"}
                              {...methods?.register("channelId", {
                                required: "This field is required.",
                              })}
                            >
                              <option value={0} defaultChecked>
                                Create a new channel for me
                              </option>
                              {channels?.map((channel, i) => (
                                <option
                                  key={channel.id}
                                  value={channel.id}
                                  defaultChecked={i === 0}
                                >
                                  {channel.name}
                                </option>
                              ))}
                            </Select>
                            <FormErrorMessage>
                              {methods?.formState?.errors?.channelId?.message}
                            </FormErrorMessage>
                          </FormControl>
                        </Section>
                        <Section title="Security level">
                          <PickMode />
                        </Section>
                        <Alert colorScheme="gray" py="3">
                          <Stack spacing={2}>
                            <AlertTitle>Disclaimer</AlertTitle>
                            <AlertDescription fontSize="sm" pl="2">
                              <UnorderedList>
                                <ListItem>
                                  Ethereum wallet is required for authentication
                                </ListItem>
                                <ListItem>
                                  You are hiding your members and server from
                                  unverified users
                                </ListItem>
                                <ListItem>
                                  Guild Guard protects your server from bots, not
                                  from humans with malicious intent
                                </ListItem>
                              </UnorderedList>
                            </AlertDescription>
                          </Stack>
                        </Alert>
                        <SimpleGrid columns={2} gap={4}>
                          <Button
                            colorScheme="gray"
                            disabled={!!account}
                            onClick={openWalletSelectorModal}
                          >
                            Connect wallet
                          </Button>
                          <Button
                            colorScheme="green"
                            disabled={!account}
                            isLoading={isLoading || isSigning}
                            loadingText={loadingText}
                            onClick={methods?.handleSubmit?.(onSubmit, console.log)}
                          >
                            {response ? "Success" : "Let's go!"}
                          </Button>
                        </SimpleGrid>
                      </Stack>
                    </Card>
                  </CardMotionWrapper>
                </GridItem>
              )}
            </AnimatePresence>
          </AnimateSharedLayout>
        </SimpleGrid>

        <DynamicDevTool control={methods.control} />
      </FormProvider>
    </Layout>
  )
}

export default Page