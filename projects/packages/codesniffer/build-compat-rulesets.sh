#!/usr/bin/env bash

set -eo pipefail

# Ensure consistent sorting.
export LC_ALL=C.UTF-8

BASE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

TMPDIR="${TMPDIR:-/tmp}"
DIR="$(mktemp -d "${TMPDIR%/}/codesniffer-build-compat-rulesets.XXXXXXXX")"
trap 'rm -rf "$DIR"' EXIT
cd "$DIR"

PHP_VERSIONS=( 7.2 7.3 7.4 8.0 8.1 8.2 8.3 8.4 )

function info {
	printf '\n\e[1m%s\e[0m\n' "$*"
}

# We make the assumption that PHPCompatibility has comprehensive tests written around running phpcs against files named `*.inc`,
# so if we run phpcs over those files, every rule and message will be triggered.
info "== Cloning PHPCompatibility/PHPCompatibility =="
git clone --depth=1 https://github.com/PHPCompatibility/PHPCompatibility
mapfile -t FILES < <( find PHPCompatibility/PHPCompatibility/Tests/ -name \*.inc )

# Set up composer for installing packages.
info "== Setting up composer =="
echo '{}' > composer.json
composer config --no-interaction allow-plugins.dealerdirect/phpcodesniffer-composer-installer true
composer require --dev dealerdirect/phpcodesniffer-composer-installer
# Hotfix for a bug in phpcompatibiliy v9.x
sed -i.bak 's!$message = vsprintf($message, $data);!$message = vsprintf($message, (array) $data);!' vendor/squizlabs/php_codesniffer/src/Files/File.php

# Run against current relese version.
info "== Getting rules with phpcompatibility/php-compatibility =="
composer require --dev phpcompatibility/php-compatibility
for V in "${PHP_VERSIONS[@]}"; do
	info "=== PHP $V ==="
	{ vendor/bin/phpcs -p -s --report-width=10000 --standard=PHPCompatibility --runtime-set testVersion "$V-" "${FILES[@]}" || true; } | sed -n 's/.* (\(PHPCompatibility\.[^)]\+\))$/\1/p' | sort -u > rel-$V.txt
	echo "Got $(grep -c . "rel-$V.txt") rules"
done


# Run with dev-develop version too to get all the new rules.
info "== Getting rules with phpcompatibility/php-compatibility=dev-develop =="
composer require --dev phpcompatibility/php-compatibility=dev-develop
for V in "${PHP_VERSIONS[@]}"; do
	info "=== PHP $V ==="
	{ vendor/bin/phpcs -p -s --report-width=10000 --standard=PHPCompatibility --runtime-set testVersion "$V-" "${FILES[@]}" || true; } | sed -n 's/.* (\(PHPCompatibility\.[^)]\+\))$/\1/p' | sort -u > dev-$V.txt
	echo "Got $(grep -c . "dev-$V.txt") rules"
done

# Run with phpcompatibility/phpcompatibility-wp too.
info "== Getting rules with phpcompatibility/phpcompatibility-wp =="
composer remove --dev phpcompatibility/php-compatibility
composer require --dev phpcompatibility/phpcompatibility-wp
for V in "${PHP_VERSIONS[@]}"; do
	info "=== PHP $V ==="
	{ vendor/bin/phpcs -p -s --report-width=10000 --standard=PHPCompatibilityWP --runtime-set testVersion "$V-" "${FILES[@]}" || true; } | sed -n 's/.* (\(PHPCompatibility\.[^)]\+\))$/\1/p' | sort -u > wp-$V.txt
	echo "Got $(grep -c . "wp-$V.txt") rules"
done

# And its dev version.
info "== Getting rules with phpcompatibility/phpcompatibility-wp=dev-master =="
composer remove --dev phpcompatibility/php-compatibility-wp
composer require --dev phpcompatibility/php-compatibility='dev-develop as 9.9999.9999'
composer require --dev phpcompatibility/phpcompatibility-wp=dev-master
for V in "${PHP_VERSIONS[@]}"; do
	info "=== PHP $V ==="
	{ vendor/bin/phpcs -p -s --report-width=10000 --standard=PHPCompatibilityWP --runtime-set testVersion "$V-" "${FILES[@]}" || true; } | sed -n 's/.* (\(PHPCompatibility\.[^)]\+\))$/\1/p' | sort -u > wpdev-$V.txt
	echo "Got $(grep -c . "wpdev-$V.txt") rules"
done

# Process the rules lists to get incremental lists for each version.
info "== Processing rules lists =="
F=( -f /dev/null )
V0="${PHP_VERSIONS[0]}"
for V in "${PHP_VERSIONS[@]:1}"; do
	{ diff -u <( sort -u "dev-$V0.txt" "rel-$V0.txt" "wp-$V0.txt" ) <( sort -u "dev-$V.txt" "rel-$V.txt" "wp-$V.txt" ) || true; } | sed -n 's/^-\(PHPCompatibility\.\)/\1/p' | grep -vFx "${F[@]}" > "$V.txt"
	F+=( -f "$V.txt" )
	echo "Found $(grep -c . "$V.txt") rules that no longer apply in PHP $V"
done
{ diff -u <( sort -u rel-*.txt ) <( sort -u wp-*.txt ) || true; diff -u <( sort -u dev-*.txt ) <( sort -u wpdev-*.txt ) || true; } | sed -n 's/^-\(PHPCompatibility\.\)/\1/p' | sort -u > WP.txt

# Go back to the monorepo and build the rulesets.
info "== Generating Jetpack-Compat rulesets =="
cd "$BASE"
rm Jetpack-Compat-*/ruleset.xml
rmdir Jetpack-Compat-*
P='<rule ref="PHPCompatibility">'
for V in "${PHP_VERSIONS[@]:1}"; do
	VV=${V//./}
	printf 'Jetpack-Compat-%s... ' "$VV"
	mkdir "Jetpack-Compat-$VV"
	cat > "Jetpack-Compat-$VV/ruleset.xml" <<EOF
<?xml version="1.0"?>
<ruleset name="Jetpack-Compat-$VV">
	<description>Standard to disable PHPCompatibility rules that trigger with $V0 but not $V.</description>
	<!-- This standard is automatically generated by build-compat-rulesets.sh -->

	$P
EOF
	sed 's!.*!\t\t<exclude name="&" />!' "$DIR/$V.txt" >> "Jetpack-Compat-$VV/ruleset.xml"
	echo $'\t</rule>\n</ruleset>' >> "Jetpack-Compat-$VV/ruleset.xml"

	P="<rule ref=\"Jetpack-Compat-$VV\">"

	echo "done!"
done

printf 'Jetpack-Compat-NoWP... '
mkdir "Jetpack-Compat-NoWP"
cat > "Jetpack-Compat-NoWP/ruleset.xml" <<EOF
<?xml version="1.0"?>
<ruleset name="Jetpack-Compat-NoWP">
	<description>Standard to re-enable PHPCompatibility rules disabled by PHPCompatibilityWP.</description>
	<!-- This standard is automatically generated by build-compat-rulesets.sh -->

EOF
sed 's!.*!\t<rule ref="&" />!' "$DIR/WP.txt" >> "Jetpack-Compat-NoWP/ruleset.xml"
echo $'\n</ruleset>' >> "Jetpack-Compat-NoWP/ruleset.xml"

echo "done!"
