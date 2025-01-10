import * as Dialog from "@radix-ui/react-dialog";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { Form, Link } from "@remix-run/react";
import { Menu, X } from "lucide-react";
import { Logo } from "~/assets/Logo";
import { Button } from "~/components/Button";
import { useOptionalUser } from "~/utils/user";

function Header() {
  const loggedInUser = useOptionalUser();
  const isLoggedIn = !!loggedInUser?.id;

  return (
    <header className="isolate bg-white py-4">
      <NavigationMenu.Root className="container mx-auto flex items-center">
        <div className="flex items-center space-x-10">
          <a href="/">
            <span className="sr-only">Eureka</span>
            <Logo className="h-8" />
          </a>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-8">
          {isLoggedIn ? (
            <Form
              action="/logout"
              method="POST"
              className="font-medium text-gray-700"
            >
              <Button type="submit" variant="link">
                Log out
              </Button>
            </Form>
          ) : (
            <>
              <Link to="/login" className="font-medium text-gray-700 text-sm">
                Log in
              </Link>
              <Button>Sign up</Button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <div className="flex flex-1 justify-end space-x-3 lg:hidden">
          {isLoggedIn ? (
            <Form
              action="/logout"
              method="POST"
              className="font-medium text-gray-700"
            >
              <Button type="submit" variant="link">
                Log out
              </Button>
            </Form>
          ) : (
            <Button>Sign up</Button>
          )}
          {!isLoggedIn && (
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <Button variant="ghost" iconButton>
                  <span className="sr-only">Open Menu</span>
                  <Menu />
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="pointer-events-none fixed inset-0 bg-black opacity-50 data-[state=closed]:duration-200 data-[state=open]:duration-300 data-[state=closed]:ease-in-out data-[state=open]:ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content asChild>
                  <NavigationMenu.Root
                    orientation="vertical"
                    className="fixed inset-y-0 right-0 flex w-full max-w-xs flex-col overflow-auto border-l border-gray-200 bg-white shadow outline-none data-[state=closed]:duration-200 data-[state=open]:duration-500 data-[state=closed]:ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=open]:ease-slider-in sm:max-w-sm lg:hidden"
                  >
                    <div className="sticky top-0 z-20 flex items-center justify-between bg-white px-[15px] py-5 sm:px-6">
                      <a href="/" className="sm:hidden">
                        <span className="sr-only">Eureka</span>
                        <Logo className="h-8" />
                      </a>
                      <Dialog.Close asChild>
                        <Button variant="ghost" iconButton className="ml-auto">
                          <span className="sr-only">Close Menu</span>
                          <X />
                        </Button>
                      </Dialog.Close>
                    </div>
                    <div className="divide-y divide-gray-100 px-[15px] pb-5 sm:px-6">
                      <div className="py-6">
                        <Link
                          to="/login"
                          className="-mx-3 block rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Log in
                        </Link>
                      </div>
                    </div>
                  </NavigationMenu.Root>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          )}
        </div>
      </NavigationMenu.Root>
    </header>
  );
}

export { Header };
