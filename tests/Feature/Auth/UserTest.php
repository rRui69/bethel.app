<?php

namespace Tests\Unit\Models;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function full_name_accessor_combines_first_and_last_name(): void
    {
        $user = User::factory()->make([
            'first_name' => 'Juan',
            'last_name'  => 'dela Cruz',
        ]);

        $this->assertEquals('Juan dela Cruz', $user->full_name);
    }

    /** @test */
    public function is_super_admin_returns_true_for_super_admin_role(): void
    {
        $user = User::factory()->make(['role' => 'super_admin']);
        $this->assertTrue($user->isSuperAdmin());
    }

    /** @test */
    public function is_super_admin_returns_false_for_parishioner(): void
    {
        $user = User::factory()->make(['role' => 'parishioner']);
        $this->assertFalse($user->isSuperAdmin());
    }

    /** @test */
    public function is_admin_returns_true_for_all_admin_roles(): void
    {
        foreach (['super_admin', 'parish_admin', 'clergymen'] as $role) {
            $user = User::factory()->make(['role' => $role]);
            $this->assertTrue($user->isAdmin(), "Expected isAdmin() to be true for role: {$role}");
        }
    }

    /** @test */
    public function is_admin_returns_false_for_parishioner(): void
    {
        $user = User::factory()->make(['role' => 'parishioner']);
        $this->assertFalse($user->isAdmin());
    }

    /** @test */
    public function is_active_accessor_works_correctly(): void
    {
        $active   = User::factory()->make(['account_status' => 'Active']);
        $inactive = User::factory()->make(['account_status' => 'Inactive']);

        $this->assertTrue($active->is_active);
        $this->assertFalse($inactive->is_active);
    }
}
