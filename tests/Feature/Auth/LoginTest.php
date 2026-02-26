<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function super_admin_is_redirected_to_admin_dashboard_after_login(): void
    {
        $admin = User::factory()->create([
            'role'           => 'super_admin',
            'account_status' => 'Active',
            'password'       => bcrypt('Password123!'),
        ]);

        $response = $this->postJson('/login', [
            'login'    => $admin->email,
            'password' => 'Password123!',
        ]);

        $response->assertOk()
                 ->assertJson([
                     'success'      => true,
                     'redirect_url' => route('admin.dashboard'),
                 ]);
    }

    /** @test */
    public function parishioner_is_redirected_to_home_after_login(): void
    {
        $user = User::factory()->create([
            'role'           => 'parishioner',
            'account_status' => 'Active',
            'password'       => bcrypt('Password123!'),
        ]);

        $response = $this->postJson('/login', [
            'login'    => $user->email,
            'password' => 'Password123!',
        ]);

        $response->assertOk()
                 ->assertJson([
                     'success'      => true,
                     'redirect_url' => route('home'),
                 ]);
    }

    /** @test */
    public function login_fails_with_wrong_password(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('CorrectPassword123!'),
        ]);

        $response = $this->postJson('/login', [
            'login'    => $user->email,
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function inactive_user_cannot_login(): void
    {
        $user = User::factory()->create([
            'account_status' => 'Inactive',
            'password'       => bcrypt('Password123!'),
        ]);

        $response = $this->postJson('/login', [
            'login'    => $user->email,
            'password' => 'Password123!',
        ]);

        // Should fail — inactive accounts should be rejected
        $response->assertStatus(422);
    }
}
