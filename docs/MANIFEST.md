# Transaction Manifests

### Enabling Transaction Manifests

Transaction Manifests are important to prevent `CORS`. By default, manifests are disabled in the `.env` files. You can enable it by changing:

```bash
MANIFESTS=0
```

to

```bash
MANIFESTS=1
```

In order to effectively use manifests. You need to have domain wildcards pointing to your domain.

### Using BIP39 or SHA256

There are two different types of transaction manifests subdomains. SHA256 and BIP39. You can enable SHA256 subdomains by changing your `.env` file to:

```bash
BIP39=0
```

You can enable BIP39 subdomains by changing the `.env` file to:

```bash
BIP39=1
```

## Manifests for Websites

Manifests are fairly simple for actual domains. Let's say own the domain `amplify.testing123`. Follow these steps to enable transaction manifests on your website.

1. Point your `@` record to your Gateway server.

    - This would be an `A` record for an IP.

    - This would be a `CNAME` record for a service's subdomain (ie: AWS EC2, Heroku)

2. Point your `*.amplify.testing123` record to your Gateway server. Follow the same rules as 1.

3. Test your Gateway endpoints
    
    - Run `ping amplify.testing123`. Ensure it runs a valid response.

    - Go to any transaction id on `amplify.testing123/[tx id]` and ensure it redirects to a valid transaction manifest path.

## Manifests for Development

Using transaction manifests is a bit more complicated while developing. Since it involves using `dnsmasq` and modifying your network manager. Assuming you're working with Ubuntu. Follow these steps to enable a Transaction Manifest development environment.

### Setup DNSMasq

First install `dnsmasq`:

```bash
sudo apt-get install dnsmasq -y
```

Then enable `dnsmasq` in `NetworkManager`:

```conf
[main]
plugins=ifupdown,keyfile
dns=dnsmasq

[ifupdown]
managed=false

[device]
wifi.scan-rand-mac-address=no
```

And make sure `/etc/resolv.conf` points to `NetworkManager`:

```bash
sudo rm /etc/resolv.conf
sudo ln -s /var/run/NetworkManager/resolv.conf /etc/resolv.conf
```

Make sure that `/var/run/NetworkManager/resolv.conf` has a nameserver of `127.0.1.1`:

```conf
search lan
nameserver 127.0.1.1
```

### Configure a test domain

In this example. We use `amplify.testing` as the url. Create a new `config` url.

```bash
/etc/NetworkManager/dnsmasq.d/amplify.testing.conf
```

In this config file append the following.

```conf
address=/amplify.testing/127.0.0.1
```

Restart the network manager and you should be good to go!

```bash
sudo systemctl reload NetworkManager
```

### Testing your local domain.

Confirm you can test your local domain by going to:

```bash
http://amplify.testing/
```

If it returns the Gateway server's generic output. You should be good to go!