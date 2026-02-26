<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            // Credentials
            'username'       => fake()->unique()->userName(),
            'email'          => fake()->unique()->safeEmail(),
            'password'       => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),

            // Role & Status
            'role'           => 'parishioner',
            'account_status' => 'Active',

            // Personal
            'first_name'     => fake()->firstName(),
            'middle_name'    => fake()->optional(0.6)->lastName(),
            'last_name'      => fake()->lastName(),
            'birth_date'     => fake()->dateTimeBetween('-60 years', '-18 years')->format('Y-m-d'),
            'gender'         => fake()->randomElement(['Male', 'Female', 'Prefer not to say']),

            // Contact — phone as string to support PH formats
            'phone'          => '+63-9' . fake()->numerify('##-###-####'),
            'country'        => 'Philippines',
            'province'       => fake()->randomElement(['Metro Manila', 'Cebu', 'Davao', 'Laguna', 'Cavite']),
            'city'           => fake()->city(),
            'barangay'       => 'Brgy. ' . fake()->lastName(),
            'street_address' => fake()->streetAddress(),
            'zip_code'       => fake()->numerify('####'),

            'email_verified_at' => now(),
        ];
    }

    // ── State Methods ─────────────────────────────────────────────

    public function superAdmin(): static
    {
        return $this->state(['role' => 'super_admin']);
    }

    public function parishAdmin(): static
    {
        return $this->state(['role' => 'parish_admin']);
    }

    public function clergymen(): static
    {
        return $this->state(['role' => 'clergymen']);
    }

    public function inactive(): static
    {
        return $this->state(['account_status' => 'Inactive']);
    }

    public function suspended(): static
    {
        return $this->state(['account_status' => 'Suspended']);
    }

    public function unverified(): static
    {
        return $this->state(['email_verified_at' => null]);
    }
}
