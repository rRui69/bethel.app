<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccessControlTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function unauthenticated_user_is_redirected_from_admin_dashboard(): void
    {
        $this->get('/admin/dashboard')
             ->assertRedirect('/login');
    }

    /** @test */
    public function parishioner_gets_403_on_admin_dashboard(): void
    {
        $parishioner = User::factory()->create(['role' => 'parishioner']);

        $this->actingAs($parishioner)
             ->get('/admin/dashboard')
             ->assertForbidden();
    }

    /** @test */
    public function parishioner_gets_403_on_admin_api_users(): void
    {
        $parishioner = User::factory()->create(['role' => 'parishioner']);

        $this->actingAs($parishioner)
             ->getJson('/admin/api/users')
             ->assertForbidden();
    }

    /** @test */
    public function super_admin_can_access_admin_dashboard(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);

        $this->actingAs($admin)
             ->get('/admin/dashboard')
             ->assertOk();
    }

    /** @test */
    public function parish_admin_can_access_admin_dashboard(): void
    {
        $admin = User::factory()->create(['role' => 'parish_admin']);

        $this->actingAs($admin)
             ->get('/admin/dashboard')
             ->assertOk();
    }

    /** @test */
    public function clergymen_can_access_admin_dashboard(): void
    {
        $clergy = User::factory()->create(['role' => 'clergymen']);

        $this->actingAs($clergy)
             ->get('/admin/dashboard')
             ->assertOk();
    }
}
